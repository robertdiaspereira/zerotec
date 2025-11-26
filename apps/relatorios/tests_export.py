# tests_export.py
"""Test DRE export endpoint (PDF and Excel)."""

from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status


def test_dre_export_pdf():
    client = APIClient()
    url = reverse('relatorios:dre-export')
    response = client.get(url + '?ano=2025&format=pdf')
    assert response.status_code == status.HTTP_200_OK
    assert response['Content-Type'] == 'application/pdf'


def test_dre_export_xlsx():
    client = APIClient()
    url = reverse('relatorios:dre-export')
    response = client.get(url + '?ano=2025&format=xlsx')
    assert response.status_code == status.HTTP_200_OK
    assert response['Content-Type'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
