from src.config.db_config import db

class Mesa(db.Model):
    __tablename__ = 'mesas'

    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.Integer, nullable=False, unique=True)
    capacidade = db.Column(db.Integer, nullable=False)
    disponivel = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "numero": self.numero,
            "capacidade": self.capacidade,
            "disponivel": self.disponivel
        }
