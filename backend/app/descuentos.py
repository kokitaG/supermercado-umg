def calcular_descuento(subtotal: float, cantidad_items: int) -> float:
    """
    Aplica reglas de descuento comercial:
    - Si el subtotal supera 500 y lleva mas de 5 articulos: 10% de descuento.
    - Si el subtotal supera 200 y lleva mas de 3 articulos: 5% de descuento.
    - En cualquier otro caso: 0% de descuento.
    """
    if subtotal < 0 or cantidad_items < 0:
        raise ValueError("Los valores no pueden ser negativos")

    if subtotal >= 500.0 and cantidad_items >= 5:
        return round(subtotal * 0.10, 2)
    elif subtotal >= 200.0 and cantidad_items >= 3:
        return round(subtotal * 0.05, 2)

    return 0.0
