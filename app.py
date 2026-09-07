from flask import Flask, render_template, request, jsonify
import pickle
import os
from googleapiclient.discovery import build
from src.cleaner import (
    obtener_servicio_gmail,
    buscar_correos,
    obtener_detalle_correo,
    clasificar_con_gemini,
    ejecutar_limpieza
)

app = Flask(__name__)

# Ruta principal
@app.route('/')
def index():
    return render_template('index.html')

# Ruta para buscar y analizar correos
@app.route('/analizar', methods=['POST'])
def analizar():
    query = request.form.get('query', '')
    limite = int(request.form.get('limite', 10))
    
    if not query:
        return jsonify({'error': 'Filtro de búsqueda vacío'}), 400
    
    # Obtener servicio de Gmail
    servicio = obtener_servicio_gmail()
    
    # Buscar correos
    mensajes_crudos = buscar_correos(servicio, query, max_resultados=limite)
    
    if not mensajes_crudos:
        return jsonify({'correos': [], 'mensaje': 'No se encontraron correos.'})
    
    # Analizar cada correo con Gemini
    correos_procesados = []
    for msg in mensajes_crudos:
        correo = obtener_detalle_correo(servicio, msg['id'])
        if correo:
            clasificacion = clasificar_con_gemini(correo)
            correos_procesados.append({
                'id': correo['id'],
                'remitente': correo['remitente'],
                'asunto': correo['asunto'],
                'resumen': correo['resumen'],
                'clasificacion': clasificacion
            })
    
    # Guardar en sesión o variable global para la limpieza
    app.config['CORREOS_PROCESADOS'] = correos_procesados
    app.config['SERVICIO_GMAIL'] = servicio
    
    return jsonify({
        'correos': correos_procesados,
        'total': len(correos_procesados)
    })

# Ruta para ejecutar la limpieza
@app.route('/limpiar', methods=['POST'])
def limpiar():
    modo = request.form.get('modo', 'simulacion')
    correos_procesados = app.config.get('CORREOS_PROCESADOS', [])
    servicio = app.config.get('SERVICIO_GMAIL', None)
    
    if not correos_procesados or not servicio:
        return jsonify({'error': 'No hay correos para procesar'}), 400
    
    # Ejecutar limpieza
    resultados = ejecutar_limpieza_web(servicio, correos_procesados, modo)
    
    return jsonify({'resultados': resultados})

def ejecutar_limpieza_web(servicio, correos_procesados, modo):
    """Versión web de ejecutar_limpieza que devuelve resultados."""
    resultados = []
    
    for item in correos_procesados:
        accion = item['clasificacion']
        
        if modo == 'simulacion':
            resultados.append({
                'id': item['id'],
                'asunto': item['asunto'],
                'accion': accion,
                'estado': 'Simulación'
            })
        else:
            # Aquí iría la lógica real de limpieza
            if accion == 'Eliminar':
                resultados.append({
                    'id': item['id'],
                    'asunto': item['asunto'],
                    'accion': '🗑️ Eliminar',
                    'estado': 'Pendiente'
                })
            elif accion == 'Archivar':
                resultados.append({
                    'id': item['id'],
                    'asunto': item['asunto'],
                    'accion': '📁 Archivar',
                    'estado': 'Pendiente'
                })
            else:
                resultados.append({
                    'id': item['id'],
                    'asunto': item['asunto'],
                    'accion': '✅ Conservar',
                    'estado': 'Pendiente'
                })
    
    return resultados

if __name__ == '__main__':
    app.run(debug=True, port=5000)