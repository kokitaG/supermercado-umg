def test_verificacion_inicial():
    sistema = "Supermercado UMG"
    assert sistema == "Supermercado UMG"

def test_calculo_subtotal():
    precio = 10.50
    cantidad = 4
    subtotal = precio * cantidad
    assert subtotal == 42.00
