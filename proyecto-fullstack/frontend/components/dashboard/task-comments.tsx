'use client';

import { useState, useEffect } from 'react';
import { getTaskComments, createComment, updateComment, deleteComment } from '@/lib/api-simple';
import { useAuthStore } from '@/lib/store/authStore';
import { safeFormatDistanceToNow } from '@/lib/utils';
import { MessageCircle, Send, Edit2, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
}

interface TaskCommentsProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskComments({ taskId, isOpen, onClose }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user } = useAuthStore();

  // Cargar comentarios
  const loadComments = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const response = await getTaskComments(taskId);
      if (response.success && Array.isArray(response.data)) {
        setComments(response.data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadComments();
    }
  }, [isOpen, taskId]);

  // Crear comentario
  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await createComment(taskId, { content: newComment.trim() });
      if (response.success) {
        setNewComment('');
        loadComments(); // Recargar comentarios
        toast.success('Comentario agregado');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Error al crear comentario');
    }
  };

  // Iniciar edición
  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // Guardar edición
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await updateComment(commentId, { content: editContent.trim() });
      if (response.success) {
        setEditingComment(null);
        setEditContent('');
        loadComments(); // Recargar comentarios
        toast.success('Comentario actualizado');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
    }
  };

  // Eliminar comentario
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      const response = await deleteComment(commentId);
      if (response.success) {
        loadComments(); // Recargar comentarios
        toast.success('Comentario eliminado');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comentarios de la Tarea</h3>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm">
              {Array.isArray(comments) ? comments.length : 0}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p>No hay comentarios aún</p>
              <p className="text-sm">Sé el primero en comentar esta tarea</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {/* Comment Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                        {comment.authorAvatar ? (
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.authorName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {safeFormatDistanceToNow(comment.createdAt)}
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <span className="ml-1">(editado)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Solo para el autor */}
                    {user?.id === comment.authorId && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Editar comentario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar comentario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] dark:bg-gray-900 dark:text-gray-100"
                        placeholder="Escribe tu comentario..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={!editContent.trim()}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Comment Form */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || ''}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="min-h-[80px] mb-3 dark:bg-gray-900 dark:text-gray-100"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Comentar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
