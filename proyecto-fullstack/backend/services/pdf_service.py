"""
Servicio para generación de reportes PDF
"""
import os
import tempfile
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.linecharts import HorizontalLineChart
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Para evitar problemas con GUI
from services.project_service import ProjectService
from services.task_service import TaskService
from models.user import User
from models.project import Project
from models.task import Task
from database import db

class PDFService:
    """Servicio para generar reportes PDF"""
    
    @staticmethod
    def _get_styles():
        """Obtener estilos para el PDF"""
        styles = getSampleStyleSheet()
        
        # Estilo personalizado para títulos
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.darkblue,
            alignment=1  # Centrado
        )
        
        # Estilo para subtítulos
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            textColor=colors.darkgreen
        )
        
        return {
            'title': title_style,
            'subtitle': subtitle_style,
            'normal': styles['Normal'],
            'heading': styles['Heading2']
        }
    
    @staticmethod
    def _create_header(story, title, subtitle=None):
        """Crear encabezado del reporte"""
        styles = PDFService._get_styles()
        
        # Título principal
        story.append(Paragraph(title, styles['title']))
        
        # Subtítulo si existe
        if subtitle:
            story.append(Paragraph(subtitle, styles['subtitle']))
        
        # Fecha de generación
        fecha_generacion = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        story.append(Paragraph(f"<b>Fecha de generación:</b> {fecha_generacion}", styles['normal']))
        story.append(Spacer(1, 20))
    
    @staticmethod
    def _create_table(data, headers, col_widths=None):
        """Crear tabla para el PDF"""
        if not data:
            return None
        
        # Preparar datos con encabezados
        table_data = [headers] + data
        
        # Crear tabla
        table = Table(table_data, colWidths=col_widths)
        
        # Estilo de la tabla
        table.setStyle(TableStyle([
            # Encabezados
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            
            # Contenido
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            
            # Bordes
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        return table
    
    @staticmethod
    def generate_project_report(project_id):
        """Generar reporte PDF de un proyecto específico"""
        try:
            # Obtener datos del proyecto
            project, error = ProjectService.get_project_by_id(project_id)
            if error:
                return None, error
            
            # Obtener estadísticas del proyecto
            stats, stats_error = ProjectService.get_project_stats(project_id)
            if stats_error:
                return None, stats_error
            
            # Obtener tareas del proyecto
            tasks, tasks_error = TaskService.get_all_tasks({'project_id': project_id})
            if tasks_error:
                return None, tasks_error
            
            # Crear archivo temporal
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            # Crear documento PDF
            doc = SimpleDocTemplate(temp_path, pagesize=A4)
            story = []
            styles = PDFService._get_styles()
            
            # Encabezado
            PDFService._create_header(
                story,
                f"Reporte del Proyecto: {project['name']}",
                f"ID: {project['id']}"
            )
            
            # Información del proyecto
            story.append(Paragraph("Información del Proyecto", styles['heading']))
            project_info = [
                ['Campo', 'Valor'],
                ['Nombre', project['name']],
                ['Descripción', project['description'] or 'Sin descripción'],
                ['Fecha de Creación', project['created_at']],
                ['Estado', project['status']],
                ['Creado por', project.get('created_by_name', 'N/A')]
            ]
            
            table = PDFService._create_table(project_info[1:], project_info[0])
            if table:
                story.append(table)
            story.append(Spacer(1, 20))
            
            # Estadísticas del proyecto
            story.append(Paragraph("Estadísticas del Proyecto", styles['heading']))
            stats_info = [
                ['Métrica', 'Valor'],
                ['Total de Tareas', str(stats.get('total_tasks', 0))],
                ['Tareas Completadas', str(stats.get('completed_tasks', 0))],
                ['Tareas en Progreso', str(stats.get('in_progress_tasks', 0))],
                ['Tareas Pendientes', str(stats.get('pending_tasks', 0))],
                ['Progreso (%)', f"{stats.get('progress_percentage', 0):.1f}%"]
            ]
            
            table = PDFService._create_table(stats_info[1:], stats_info[0])
            if table:
                story.append(table)
            story.append(Spacer(1, 20))
            
            # Lista de tareas
            if tasks:
                story.append(Paragraph("Tareas del Proyecto", styles['heading']))
                tasks_data = []
                for task in tasks:
                    tasks_data.append([
                        task['title'],
                        task['status'],
                        task['priority'],
                        task.get('assigned_to_name', 'Sin asignar'),
                        task.get('due_date', 'Sin fecha')
                    ])
                
                if tasks_data:
                    table = PDFService._create_table(
                        tasks_data,
                        ['Título', 'Estado', 'Prioridad', 'Asignado a', 'Fecha Límite'],
                        col_widths=[2*inch, 1*inch, 1*inch, 1.5*inch, 1*inch]
                    )
                    story.append(table)
            
            # Generar PDF
            doc.build(story)
            
            return temp_path, None
            
        except Exception as e:
            return None, f"Error generando reporte: {str(e)}"
    
    @staticmethod
    def generate_tasks_report(filters=None):
        """Generar reporte PDF de tareas con filtros"""
        try:
            # Obtener tareas con filtros
            tasks, error = TaskService.get_all_tasks(filters or {})
            if error:
                return None, error
            
            # Crear archivo temporal
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            # Crear documento PDF
            doc = SimpleDocTemplate(temp_path, pagesize=A4)
            story = []
            styles = PDFService._get_styles()
            
            # Encabezado
            filter_text = ""
            if filters:
                filter_parts = []
                if filters.get('project_id'):
                    filter_parts.append(f"Proyecto: {filters['project_id']}")
                if filters.get('status'):
                    filter_parts.append(f"Estado: {filters['status']}")
                if filters.get('priority'):
                    filter_parts.append(f"Prioridad: {filters['priority']}")
                if filter_parts:
                    filter_text = f"Filtros aplicados: {', '.join(filter_parts)}"
            
            PDFService._create_header(
                story,
                "Reporte de Tareas",
                filter_text
            )
            
            # Estadísticas de tareas
            stats, stats_error = TaskService.get_tasks_stats(filters or {})
            if not stats_error and stats:
                story.append(Paragraph("Resumen de Tareas", styles['heading']))
                stats_info = [
                    ['Total de Tareas', str(stats.get('total_tasks', 0))],
                    ['Completadas', str(stats.get('completed_tasks', 0))],
                    ['En Progreso', str(stats.get('in_progress_tasks', 0))],
                    ['Pendientes', str(stats.get('pending_tasks', 0))]
                ]
                
                table = PDFService._create_table(stats_info, ['Métrica', 'Valor'])
                if table:
                    story.append(table)
                story.append(Spacer(1, 20))
            
            # Lista de tareas
            if tasks:
                story.append(Paragraph("Lista de Tareas", styles['heading']))
                tasks_data = []
                for task in tasks:
                    tasks_data.append([
                        task['title'],
                        task.get('project_name', 'Sin proyecto'),
                        task['status'],
                        task['priority'],
                        task.get('assigned_to_name', 'Sin asignar'),
                        task.get('due_date', 'Sin fecha'),
                        task.get('created_at', '')
                    ])
                
                if tasks_data:
                    table = PDFService._create_table(
                        tasks_data,
                        ['Título', 'Proyecto', 'Estado', 'Prioridad', 'Asignado', 'Fecha Límite', 'Creada'],
                        col_widths=[1.5*inch, 1*inch, 0.8*inch, 0.8*inch, 1*inch, 1*inch, 0.9*inch]
                    )
                    story.append(table)
            else:
                story.append(Paragraph("No se encontraron tareas con los filtros aplicados.", styles['normal']))
            
            # Generar PDF
            doc.build(story)
            
            return temp_path, None
            
        except Exception as e:
            return None, f"Error generando reporte: {str(e)}"
    
    @staticmethod
    def generate_general_report():
        """Generar reporte PDF general del sistema"""
        try:
            # Obtener estadísticas generales
            project_stats, p_error = ProjectService.get_all_projects_stats()
            task_stats, t_error = TaskService.get_all_tasks_stats()
            
            if p_error or t_error:
                return None, f"Error obteniendo estadísticas: {p_error or t_error}"
            
            # Crear archivo temporal
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            # Crear documento PDF
            doc = SimpleDocTemplate(temp_path, pagesize=A4)
            story = []
            styles = PDFService._get_styles()
            
            # Encabezado
            PDFService._create_header(
                story,
                "Reporte General del Sistema",
                "Dashboard de Gestión de Proyectos"
            )
            
            # Estadísticas generales
            story.append(Paragraph("Resumen Ejecutivo", styles['heading']))
            general_stats = [
                ['Métrica', 'Valor'],
                ['Total de Proyectos', str(project_stats.get('total_projects', 0))],
                ['Proyectos Activos', str(project_stats.get('active_projects', 0))],
                ['Total de Tareas', str(task_stats.get('total_tasks', 0))],
                ['Tareas Completadas', str(task_stats.get('completed_tasks', 0))],
                ['Tareas en Progreso', str(task_stats.get('in_progress_tasks', 0))],
                ['Tareas Pendientes', str(task_stats.get('pending_tasks', 0))],
                ['Eficiencia General', f"{(task_stats.get('completed_tasks', 0) / max(task_stats.get('total_tasks', 1), 1) * 100):.1f}%"]
            ]
            
            table = PDFService._create_table(general_stats[1:], general_stats[0])
            if table:
                story.append(table)
            story.append(Spacer(1, 20))
            
            # Distribución por estado
            story.append(Paragraph("Distribución de Tareas por Estado", styles['heading']))
            status_data = [
                ['Estado', 'Cantidad', 'Porcentaje'],
                ['Pendientes', str(task_stats.get('pending_tasks', 0)), 
                 f"{(task_stats.get('pending_tasks', 0) / max(task_stats.get('total_tasks', 1), 1) * 100):.1f}%"],
                ['En Progreso', str(task_stats.get('in_progress_tasks', 0)), 
                 f"{(task_stats.get('in_progress_tasks', 0) / max(task_stats.get('total_tasks', 1), 1) * 100):.1f}%"],
                ['Completadas', str(task_stats.get('completed_tasks', 0)), 
                 f"{(task_stats.get('completed_tasks', 0) / max(task_stats.get('total_tasks', 1), 1) * 100):.1f}%"]
            ]
            
            table = PDFService._create_table(status_data[1:], status_data[0])
            if table:
                story.append(table)
            
            # Generar PDF
            doc.build(story)
            
            return temp_path, None
            
        except Exception as e:
            return None, f"Error generando reporte: {str(e)}"
    
    @staticmethod
    def generate_metrics_report(filters=None, include_charts=True):
        """Generar reporte PDF de métricas con gráficos opcionales"""
        try:
            # Obtener métricas
            project_stats, p_error = ProjectService.get_all_projects_stats()
            task_stats, t_error = TaskService.get_all_tasks_stats(filters or {})
            
            if p_error or t_error:
                return None, f"Error obteniendo métricas: {p_error or t_error}"
            
            # Crear archivo temporal
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            # Crear documento PDF
            doc = SimpleDocTemplate(temp_path, pagesize=A4)
            story = []
            styles = PDFService._get_styles()
            
            # Encabezado
            PDFService._create_header(
                story,
                "Reporte de Métricas y Análisis",
                "Análisis Detallado del Rendimiento"
            )
            
            # Métricas de productividad
            story.append(Paragraph("Métricas de Productividad", styles['heading']))
            productivity_data = [
                ['Métrica', 'Valor', 'Descripción'],
                ['Tasa de Completación', 
                 f"{(task_stats.get('completed_tasks', 0) / max(task_stats.get('total_tasks', 1), 1) * 100):.1f}%",
                 'Porcentaje de tareas completadas'],
                ['Tareas por Proyecto', 
                 f"{task_stats.get('total_tasks', 0) / max(project_stats.get('total_projects', 1), 1):.1f}",
                 'Promedio de tareas por proyecto'],
                ['Eficiencia', 
                 f"{task_stats.get('completed_tasks', 0) / max(task_stats.get('total_tasks', 1), 1) * 100:.1f}%",
                 'Ratio de tareas completadas vs total']
            ]
            
            table = PDFService._create_table(productivity_data[1:], productivity_data[0])
            if table:
                story.append(table)
            story.append(Spacer(1, 20))
            
            # Análisis por prioridad
            story.append(Paragraph("Análisis por Prioridad", styles['heading']))
            priority_data = [
                ['Prioridad', 'Cantidad', 'Estado Promedio'],
                ['Alta', str(task_stats.get('high_priority_tasks', 0)), 'En análisis'],
                ['Media', str(task_stats.get('medium_priority_tasks', 0)), 'En análisis'],
                ['Baja', str(task_stats.get('low_priority_tasks', 0)), 'En análisis']
            ]
            
            table = PDFService._create_table(priority_data[1:], priority_data[0])
            if table:
                story.append(table)
            
            # Generar PDF
            doc.build(story)
            
            return temp_path, None
            
        except Exception as e:
            return None, f"Error generando reporte: {str(e)}"
    
    @staticmethod
    def generate_custom_report(report_config):
        """Generar reporte PDF personalizado"""
        try:
            # Crear archivo temporal
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_path = temp_file.name
            temp_file.close()
            
            # Crear documento PDF
            doc = SimpleDocTemplate(temp_path, pagesize=A4)
            story = []
            styles = PDFService._get_styles()
            
            # Encabezado personalizado
            PDFService._create_header(
                story,
                report_config.get('title', 'Reporte Personalizado'),
                f"Configuración personalizada - {datetime.now().strftime('%d/%m/%Y')}"
            )
            
            # Secciones configurables
            if report_config.get('include_projects', True):
                story.append(Paragraph("Sección de Proyectos", styles['heading']))
                projects, p_error = ProjectService.get_all_projects()
                if not p_error and projects:
                    projects_data = []
                    for project in projects:
                        projects_data.append([
                            project['name'],
                            project['status'],
                            project.get('created_at', ''),
                            str(project.get('task_count', 0))
                        ])
                    
                    table = PDFService._create_table(
                        projects_data,
                        ['Nombre', 'Estado', 'Fecha Creación', 'Tareas']
                    )
                    if table:
                        story.append(table)
                story.append(Spacer(1, 20))
            
            if report_config.get('include_tasks', True):
                story.append(Paragraph("Sección de Tareas", styles['heading']))
                tasks, t_error = TaskService.get_all_tasks(report_config.get('filters', {}))
                if not t_error and tasks:
                    # Limitar a las primeras 20 tareas para evitar reportes muy largos
                    tasks_data = []
                    for task in tasks[:20]:
                        tasks_data.append([
                            task['title'][:30] + ('...' if len(task['title']) > 30 else ''),
                            task['status'],
                            task['priority'],
                            task.get('assigned_to_name', 'Sin asignar')[:15]
                        ])
                    
                    table = PDFService._create_table(
                        tasks_data,
                        ['Título', 'Estado', 'Prioridad', 'Asignado a']
                    )
                    if table:
                        story.append(table)
                        
                    if len(tasks) > 20:
                        story.append(Paragraph(f"... y {len(tasks) - 20} tareas más", styles['normal']))
                story.append(Spacer(1, 20))
            
            if report_config.get('include_metrics', True):
                story.append(Paragraph("Métricas del Sistema", styles['heading']))
                task_stats, stats_error = TaskService.get_all_tasks_stats()
                if not stats_error and task_stats:
                    metrics_data = [
                        ['Total de Tareas', str(task_stats.get('total_tasks', 0))],
                        ['Completadas', str(task_stats.get('completed_tasks', 0))],
                        ['En Progreso', str(task_stats.get('in_progress_tasks', 0))],
                        ['Pendientes', str(task_stats.get('pending_tasks', 0))]
                    ]
                    
                    table = PDFService._create_table(metrics_data, ['Métrica', 'Valor'])
                    if table:
                        story.append(table)
            
            # Generar PDF
            doc.build(story)
            
            return temp_path, None
            
        except Exception as e:
            return None, f"Error generando reporte personalizado: {str(e)}"
