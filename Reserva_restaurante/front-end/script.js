document.getElementById("form_Reserva").addEventListener("submit", async function(event) {
    event.preventDefault();

    const reserva = {
        nome_cliente: document.getElementById("nome_cliente").value,
    telefone_cliente: document.getElementById("telefone_cliente").value,
    data: document.getElementById("data").value,
    hora: document.getElementById("hora").value,
    numero_pessoas: parseInt(document.getElementById("numero_pessoas").value)
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/reservas", {
            method: "POST",
            headers: {
                "Content-Type": "apllication/json"
            },
            body: JSON.stringify(reserva)

        });

        const dataResponse = await response.json();
        document.getElementById("mensagem").textContent = dataResponse.mensagem;

    } catch (error) {
        document.getElementById("mensagem").textContent = "Erro ao salvar reserva";

    }
});