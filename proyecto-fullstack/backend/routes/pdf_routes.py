"""
Rutas para exportación de reportes PDF
"""
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from services.pdf_service import PDFService
import os
from datetime import datetime

pdf_bp = Blueprint('pdf', __name__, url_prefix='/pdf')

@pdf_bp.route('/report/project/<project_id>', methods=['GET'])
@jwt_required()
def generate_project_report(project_id):
    """Generar reporte PDF de un proyecto específico"""
    try:
        # Generar el reporte
        pdf_path, error = PDFService.generate_project_report(project_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        if not pdf_path or not os.path.exists(pdf_path):
            return jsonify({'success': False, 'message': 'Error generando el reporte PDF'}), 500
        
        # Enviar el archivo
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'reporte_proyecto_{project_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@pdf_bp.route('/report/tasks', methods=['GET'])
@jwt_required()
def generate_tasks_report():
    """Generar reporte PDF de tareas con filtros"""
    try:
        # Obtener filtros de query params
        project_id = request.args.get('project_id')
        assigned_to = request.args.get('assigned_to')
        status = request.args.get('status')
        priority = request.args.get('priority')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if assigned_to:
            filters['assigned_to'] = assigned_to
        if status:
            filters['status'] = status
        if priority:
            filters['priority'] = priority
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date
        
        # Generar el reporte
        pdf_path, error = PDFService.generate_tasks_report(filters)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        if not pdf_path or not os.path.exists(pdf_path):
            return jsonify({'success': False, 'message': 'Error generando el reporte PDF'}), 500
        
        # Enviar el archivo
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'reporte_tareas_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@pdf_bp.route('/report/general', methods=['GET'])
@jwt_required()
def generate_general_report():
    """Generar reporte PDF general del sistema"""
    try:
        # Generar el reporte
        pdf_path, error = PDFService.generate_general_report()
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        if not pdf_path or not os.path.exists(pdf_path):
            return jsonify({'success': False, 'message': 'Error generando el reporte PDF'}), 500
        
        # Enviar el archivo
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'reporte_general_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@pdf_bp.route('/report/metrics', methods=['GET'])
@jwt_required()
def generate_metrics_report():
    """Generar reporte PDF de métricas y gráficos"""
    try:
        # Obtener parámetros opcionales
        project_id = request.args.get('project_id')
        include_charts = request.args.get('include_charts', 'true').lower() == 'true'
        
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        
        # Generar el reporte
        pdf_path, error = PDFService.generate_metrics_report(filters, include_charts)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        if not pdf_path or not os.path.exists(pdf_path):
            return jsonify({'success': False, 'message': 'Error generando el reporte PDF'}), 500
        
        # Enviar el archivo
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'reporte_metricas_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@pdf_bp.route('/report/custom', methods=['POST'])
@jwt_required()
def generate_custom_report():
    """Generar reporte PDF personalizado"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'Configuración del reporte requerida'}), 400
        
        # Validar configuración requerida
        report_config = {
            'title': data.get('title', 'Reporte Personalizado'),
            'include_projects': data.get('include_projects', True),
            'include_tasks': data.get('include_tasks', True),
            'include_metrics': data.get('include_metrics', True),
            'include_charts': data.get('include_charts', True),
            'filters': data.get('filters', {}),
            'date_range': data.get('date_range', {}),
            'sections': data.get('sections', [])
        }
        
        # Generar el reporte
        pdf_path, error = PDFService.generate_custom_report(report_config)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        if not pdf_path or not os.path.exists(pdf_path):
            return jsonify({'success': False, 'message': 'Error generando el reporte PDF'}), 500
        
        # Enviar el archivo
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'reporte_personalizado_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
