from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from src.config.db_config import init_db
from .routes import clientes_bp, funcionarios_bp, mesas_bp, reservas_bp



load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Configuração JWT e Banco de Dados ---
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
jwt = JWTManager(app)

# Banco
db = init_db(app)

# --- Registro de Rotas (Blueprints) Corrigido ---
# Você precisa registrar CADA Blueprint individualmente
app.register_blueprint(clientes_bp)
app.register_blueprint(funcionarios_bp)
app.register_blueprint(mesas_bp)
app.register_blueprint(reservas_bp)


# --- Rotas de Servidor ---

@app.route('/')
def index():
    return jsonify({"mensagem": "API do Restaurante funcionando!"})

# Rota para servir a página inicial/login.
@app.route('/login.html')
def serve_index():
    return send_from_directory('../frontend', 'login.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos como CSS e JS dentro da pasta frontend."""
    # A lógica aqui pode ser simplificada, mas mantendo a estrutura original
    # para buscar na pasta 'frontend'
    try:
        return send_from_directory('../frontend', filename)
    except FileNotFoundError:
        return jsonify({"erro": "Arquivo não encontrado"}), 404


if __name__ == '__main__':
    with app.app_context():
        # Cria as tabelas do banco de dados (se não existirem)
        db.create_all()
    app.run(debug=True, port=5000)