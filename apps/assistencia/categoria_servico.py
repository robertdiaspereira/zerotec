"""
Modelo para Categoria de Serviços
"""
from django.db import models


class CategoriaServico(models.Model):
    """Categorias para organizar os serviços"""
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome']
        verbose_name = 'Categoria de Serviço'
        verbose_name_plural = 'Categorias de Serviços'
    
    def __str__(self):
        return self.nome
