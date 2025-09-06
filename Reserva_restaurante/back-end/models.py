from database import db

class Reserva(db.Model):
    __tablename__ = 'reservas'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome_cliente = db.Column(db.String(100), nullalble=False)
    telefone_cliente = db.Column(db.String(20))
    data = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    numero_pessoas = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default="confirmada")