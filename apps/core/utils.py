"""
Utility functions
"""

import qrcode
from io import BytesIO
from django.core.files import File


def generate_qr_code(data, filename='qrcode.png'):
    """
    Generate QR Code image from data
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return File(buffer, name=filename)


def format_cpf_cnpj(value):
    """
    Format CPF or CNPJ
    """
    value = ''.join(filter(str.isdigit, value))
    
    if len(value) == 11:  # CPF
        return f'{value[:3]}.{value[3:6]}.{value[6:9]}-{value[9:]}'
    elif len(value) == 14:  # CNPJ
        return f'{value[:2]}.{value[2:5]}.{value[5:8]}/{value[8:12]}-{value[12:]}'
    
    return value


def validate_cpf(cpf):
    """
    Validate CPF
    """
    cpf = ''.join(filter(str.isdigit, cpf))
    
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    
    # Validate first digit
    sum_digits = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digit1 = (sum_digits * 10 % 11) % 10
    
    if int(cpf[9]) != digit1:
        return False
    
    # Validate second digit
    sum_digits = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digit2 = (sum_digits * 10 % 11) % 10
    
    return int(cpf[10]) == digit2


def validate_cnpj(cnpj):
    """
    Validate CNPJ
    """
    cnpj = ''.join(filter(str.isdigit, cnpj))
    
    if len(cnpj) != 14 or cnpj == cnpj[0] * 14:
        return False
    
    # Validate first digit
    weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum_digits = sum(int(cnpj[i]) * weights[i] for i in range(12))
    digit1 = (sum_digits % 11)
    digit1 = 0 if digit1 < 2 else 11 - digit1
    
    if int(cnpj[12]) != digit1:
        return False
    
    # Validate second digit
    weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum_digits = sum(int(cnpj[i]) * weights[i] for i in range(13))
    digit2 = (sum_digits % 11)
    digit2 = 0 if digit2 < 2 else 11 - digit2
    
    return int(cnpj[13]) == digit2
