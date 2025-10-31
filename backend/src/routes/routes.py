from flask import Blueprint, request, jsonify, render_template # Mantive render_template por segurança, embora não seja usado agora
from src.config.db_config import db
from src.models.cliente_model import Cliente
from src.models.funcionario_model import Funcionario
from flask_jwt_extended import create_access_token, jwt_required
from src.models.mesa_model import Mesa
from src.models.reserva_model import Reserva
from datetime import datetime
# =========================================================================
# 1. BLUEPRINT CLIENTES
# =========================================================================
clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    clientes = Cliente.query.all()
    return jsonify([c.to_dict() for c in clientes])

@clientes_bp.route('/', methods=['POST'])
def criar_cliente():
    dados = request.get_json()
    novo = Cliente(nome=dados['nome'], email=dados['email'], telefone=dados['telefone'])
    db.session.add(novo)
    db.session.commit()
    return jsonify(novo.to_dict()), 201


# Atualizar cliente
@clientes_bp.route('/<int:id>', methods=['PUT'])
#@jwt_required()
def atualizar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    dados = request.get_json()

    cliente.nome = dados.get('nome', cliente.nome)
    cliente.email = dados.get('email', cliente.email)
    cliente.telefone = dados.get('telefone', cliente.telefone)

    db.session.commit()
    return jsonify(cliente.to_dict()), 200

# Deletar cliente
@clientes_bp.route('/<int:id>', methods=['DELETE'])
#@jwt_required()
def deletar_cliente(id):
    cliente = Cliente.query.get_or_404(id)

    # Verifica se o cliente possui reservas
    reservas_ativas = Reserva.query.filter_by(cliente_id=cliente.id).all()
    if reservas_ativas:
        return jsonify({
            "erro": "Não é possível deletar este cliente, pois há reservas associadas."
        }), 400

    db.session.delete(cliente)
    db.session.commit()
    return jsonify({"mensagem": f"Cliente {id} excluído com sucesso"}), 200




# =========================================================================
# 2. BLUEPRINT FUNCIONARIOS
# =========================================================================
funcionarios_bp = Blueprint('funcionarios', __name__, url_prefix='/api/funcionarios')

# Criar novo funcionário
@funcionarios_bp.route('/', methods=['POST'])
def criar_funcionario():
    dados = request.get_json()
    funcionario = Funcionario(
        nome=dados['nome'],
        email=dados['email'],
        cargo=dados['cargo']
    )
    funcionario.set_senha(dados['senha'])
    db.session.add(funcionario)
    db.session.commit()
    return jsonify(funcionario.to_dict()), 201

# Login de Funcionário
@funcionarios_bp.route('/login', methods=['POST'])
def login_funcionario():
    dados = request.get_json()
    funcionario = Funcionario.query.filter_by(email=dados['email']).first()

    if not funcionario or not funcionario.verificar_senha(dados['senha']):
        return jsonify({"erro": "Credenciais inválidas"}), 401

    token = create_access_token(identity=funcionario.id)
    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "token": token,
        "funcionario": funcionario.to_dict()
    })

# Listar funcionários (rota protegida)
@funcionarios_bp.route('/', methods=['GET'])
#@jwt_required()
def listar_funcionarios():
    funcionarios = Funcionario.query.all()
    return jsonify([f.to_dict() for f in funcionarios])



# Atualizar funcionário
@funcionarios_bp.route('/<int:id>', methods=['PUT'])
#@jwt_required()
def atualizar_funcionario(id):
    funcionario = Funcionario.query.get_or_404(id)
    dados = request.get_json()

    funcionario.nome = dados.get('nome', funcionario.nome)
    funcionario.email = dados.get('email', funcionario.email)
    funcionario.cargo = dados.get('cargo', funcionario.cargo)

    # Atualizar senha, se enviada
    if 'senha' in dados and dados['senha']:
        funcionario.set_senha(dados['senha'])

    db.session.commit()
    return jsonify(funcionario.to_dict()), 200



# Deletar funcionário
@funcionarios_bp.route('/<int:id>', methods=['DELETE'])
def deletar_funcionario(id):
    funcionario = Funcionario.query.get_or_404(id)

    if funcionario.email == "admin@restaurante.com":
        return jsonify({"erro": "Não é possível excluir o administrador principal."}), 403

    db.session.delete(funcionario)
    db.session.commit()
    return jsonify({"mensagem": f"Funcionário {id} excluído com sucesso"}), 200




# # LOGIN DO ADMINISTRADOR
# @funcionarios_bp.route("/admin_login", methods=["POST"]) 
# def admin_login():
#     dados = request.json
#     username = dados.get("username", None)
#     password = dados.get("password", None)

#     # --- SIMULAÇÃO DE ADMIN ---
#     if username == "admin" and password == "123456":
#         access_token = create_access_token(identity=username)
#         return jsonify(access_token=access_token)

#     return jsonify({"msg": "Nome de usuário ou senha inválidos"}), 401


# =========================================================================
# 3. BLUEPRINT MESAS
# =========================================================================
mesas_bp = Blueprint('mesas', __name__, url_prefix='/api/mesas')

# Listar mesas
@mesas_bp.route('/', methods=['GET'])
def listar_mesas():
    mesas = Mesa.query.all()
    return jsonify([m.to_dict() for m in mesas])

# Criar mesa
@mesas_bp.route('/', methods=['POST'])
#@jwt_required()
def criar_mesa():
    dados = request.get_json()
    nova_mesa = Mesa(
        numero=dados['numero'],
        capacidade=dados['capacidade'],
        disponivel=True
    )
    db.session.add(nova_mesa)
    db.session.commit()
    return jsonify(nova_mesa.to_dict()), 201

# Atualizar disponibilidade
@mesas_bp.route('/<int:id>', methods=['PUT'])
#@jwt_required()
def atualizar_mesa(id):
    mesa = Mesa.query.get_or_404(id)
    dados = request.get_json()
    mesa.disponivel = dados.get('disponivel', mesa.disponivel)
    db.session.commit()
    return jsonify(mesa.to_dict())



# 🗑️ Deletar mesa
@mesas_bp.route('/<int:id>', methods=['DELETE'])
#@jwt_required()
def deletar_mesa(id):
    mesa = Mesa.query.get_or_404(id)

    # Verifica se há reservas associadas à mesa
    reservas_ativas = Reserva.query.filter_by(mesa_id=mesa.id).all()
    if reservas_ativas:
        return jsonify({
            "erro": "Não é possível deletar esta mesa, pois há reservas associadas a ela."
        }), 400

    db.session.delete(mesa)
    db.session.commit()
    return jsonify({"mensagem": f"Mesa {id} excluída com sucesso"}), 200

# =========================================================================
# 4. BLUEPRINT RESERVAS
# =========================================================================
reservas_bp = Blueprint('reservas', __name__, url_prefix='/api/reservas')

# Listar reservas
@reservas_bp.route('/', methods=['GET'])
#@jwt_required()
def listar_reservas():
    reservas = Reserva.query.all()
    return jsonify([r.to_dict() for r in reservas])

# Criar reserva
@reservas_bp.route('/', methods=['POST'])
def criar_reserva():
    dados = request.get_json()
    cliente = Cliente.query.get(dados['cliente_id'])
    mesa = Mesa.query.get(dados['mesa_id'])

    if not cliente or not mesa:
        return jsonify({"erro": "Cliente ou mesa inválidos"}), 400

    if not mesa.disponivel:
        return jsonify({"erro": "Mesa não está disponível"}), 400

    reserva = Reserva(
        cliente_id=cliente.id,
        mesa_id=mesa.id,
        data_reserva=datetime.strptime(dados['data_reserva'], "%Y-%m-%d"),
        horario=dados['horario']
    )

    mesa.disponivel = False
    db.session.add(reserva)
    db.session.commit()

    return jsonify(reserva.to_dict()), 201

# Atualizar status (por exemplo: confirmar, cancelar)
@reservas_bp.route('/<int:id>', methods=['PUT'])
#@jwt_required()
def atualizar_reserva(id):
    reserva = Reserva.query.get_or_404(id)
    dados = request.get_json()
    reserva.status = dados.get('status', reserva.status)

    if reserva.status.lower() == "cancelada":
        reserva.mesa.disponivel = True

    db.session.commit()
    return jsonify(reserva.to_dict())



# 🗑️ Deletar reserva
@reservas_bp.route('/<int:id>', methods=['DELETE'])
#@jwt_required()
def deletar_reserva(id):
    reserva = Reserva.query.get_or_404(id)

    # Se a reserva estiver ativa, liberar a mesa
    if reserva.mesa:
        reserva.mesa.disponivel = True

    db.session.delete(reserva)
    db.session.commit()

    return jsonify({"mensagem": f"Reserva {id} excluída com sucesso"}), 200