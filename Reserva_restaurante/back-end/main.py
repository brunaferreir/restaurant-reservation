from flask import Flask
from database import db
from models import Reserva

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:Jujuba345!@localhost/restaurant_reservation'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    print("Conexão feita e tabela 'reservas' criada no MySQL")
    
if __name__=="__main__":
    app.run(debug=True)