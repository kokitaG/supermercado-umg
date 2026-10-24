import pytest
import sys
from pathlib import Path

# Asegura que backend/ esté en el path de Python
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.descuentos import calcular_descuento

def test_descuento_diez_por_ciento():
    desc = calcular_descuento(600.0, 6)
    assert desc == 60.0

def test_descuento_cinco_por_ciento():
    desc = calcular_descuento(250.0, 4)
    assert desc == 12.5

def test_sin_descuento():
    desc = calcular_descuento(100.0, 2)
    assert desc == 0.0

def test_valores_negativos_error():
    with pytest.raises(ValueError):
        calcular_descuento(-50.0, 2)
