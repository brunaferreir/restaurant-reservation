from datetime import datetime, timedelta
from src.config.db_config import db 
from src.models.mesa_model import Mesa
from src.models.reserva_model import Reserva
from src.models.funcionario_model import Funcionario
from sqlalchemy import func, extract  

def get_dashboard_stats():
    """
    Busca e retorna todas as estatísticas necessárias para o dashboard,
    obtendo dados diretamente do banco de dados.
    """
    
    # 1. Cartões de Estatísticas Principais
    
    # Data de hoje para filtros
    hoje = datetime.now().date()
    
    # Reservas para hoje
    # Filtra por data_reserva == hoje (considerando apenas a parte da data)
    reservas_hoje = Reserva.query.filter(
        func.date(Reserva.data_reserva) == hoje
    ).count()

    # Mesas Ocupadas (Disponivel = False)
    mesas_ocupadas = Mesa.query.filter_by(disponivel=False).count()
    
    # Total de Mesas
    total_mesas = Mesa.query.count()
    
    # Funcionários Ativos (Presumindo que todos no banco estão ativos, ou adicionando um filtro se houver um campo 'ativo')
    funcionarios_ativos = Funcionario.query.count() 
    
    # Total de Reservas Geral (Todas as reservas no histórico)
    total_reservas_geral = Reserva.query.count()

    
    # 2. Estatísticas Rápidas (Status de Reservas)
    
    reservas_pendentes = Reserva.query.filter_by(status='Pendente').count()
    reservas_confirmadas = Reserva.query.filter_by(status='Confirmada').count()
    reservas_canceladas = Reserva.query.filter_by(status='Cancelada').count()
    
    
    # 3. Dados para o Gráfico (Reservas nos Últimos 7 Dias)
    
    data_7_dias = []
    rotulos_7_dias = []
    
    dias_semana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
    
    for i in range(7):
        data = hoje - timedelta(days=6 - i) # Começa 6 dias atrás e vai até hoje
        
        # Rótulo (ex: "Terça")
        rotulos_7_dias.append(dias_semana[data.weekday()])
        
        # Contagem de reservas para aquele dia específico
        contagem = Reserva.query.filter(
            func.date(Reserva.data_reserva) == data
        ).count()
        
        data_7_dias.append(contagem)


    # --- Retorno dos Dados ---
    stats = {
        "success": True,
        "data": {
            # Cartões de Estatísticas Principais
            "reservasHoje": reservas_hoje,
            "mesasOcupadas": mesas_ocupadas,
            "totalMesas": total_mesas,
            "funcionariosAtivos": funcionarios_ativos,
            "totalFuncionarios": Funcionario.query.count(), # Reutilizando a contagem
            "totalReservasGeral": total_reservas_geral,
            
            # Estatísticas Rápidas (Status de Reservas)
            "reservasPendentes": reservas_pendentes,
            "reservasConfirmadas": reservas_confirmadas,
            "reservasCanceladas": reservas_canceladas,
            
            # Dados para o Gráfico
            "reservas7Dias": data_7_dias,
            "labels7Dias": rotulos_7_dias
        }
    }
    
    return stats