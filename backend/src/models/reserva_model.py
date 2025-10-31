from src.config.db_config import db
from datetime import datetime

class Reserva(db.Model):
    __tablename__ = 'reservas'

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    mesa_id = db.Column(db.Integer, db.ForeignKey('mesas.id'), nullable=False)
    data_reserva = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    horario = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default="Pendente")

    cliente = db.relationship("Cliente", backref="reservas")
    mesa = db.relationship("Mesa", backref="reservas")

    def to_dict(self):
        return {
            "id": self.id,
            "cliente": self.cliente.to_dict(),
            "mesa": self.mesa.to_dict(),
            "data_reserva": self.data_reserva.strftime("%d/%m/%Y"),
            "horario": self.horario,
            "status": self.status
        }
