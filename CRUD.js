
const BASE_URL = 'https://lion-school-phbo.onrender.com/alunos';

const form = document.getElementById('studentForm');
const tabela = document.getElementById('studentsTable');
const busca = document.getElementById('search');
const campoId = document.getElementById('studentId');
const botaoSalvar = document.getElementById('saveButton');

const mensagemVazia = document.getElementById('emptyMessage');
const mensagemErro = document.getElementById('errorMessage');

const campoCelular = document.getElementById('celular');
const campoCep = document.getElementById('cep');
const campoEmail = document.getElementById('email');

let alunos = [];


// ==========================================
// REQUISIÇÕES DA API
// ==========================================

const requisicao = async (url, options = {}) => {
    const response = await fetch(url, options);

    const texto = await response.text();

    let data = null;

    try {
        data = texto ? JSON.parse(texto) : null;
    } catch {
        data = texto;
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.mensagem ||
            `Erro HTTP ${response.status}`
        );
    }

    return data;
};

const getAlunos = () => requisicao(BASE_URL);

const getAluno = (id) => requisicao(`${BASE_URL}/${id}`);

const postAluno = (aluno) => requisicao(BASE_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(aluno)
});

const putAluno = (aluno) => requisicao(`${BASE_URL}/${aluno.id}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(aluno)
});

const deleteAluno = (id) => requisicao(`${BASE_URL}/${id}`, {
    method: 'DELETE'
});


// ==========================================
// MÁSCARA DE CELULAR
// ==========================================

const formatarCelular = (valor) => {
    const numeros = String(valor || '')
        .replace(/\D/g, '')
        .slice(0, 11);

    if (numeros.length === 0) return '';

    if (numeros.length <= 2) {
        return `(${numeros}`;
    }

    if (numeros.length <= 6) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
};

campoCelular.addEventListener('input', (event) => {
    event.target.value = formatarCelular(event.target.value);
});


// ==========================================
// MÁSCARA DE CEP
// ==========================================

const formatarCEP = (valor) => {
    const numeros = String(valor || '')
        .replace(/\D/g, '')
        .slice(0, 8);

    if (numeros.length <= 5) {
        return numeros;
    }

    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
};

campoCep.addEventListener('input', (event) => {
    event.target.value = formatarCEP(event.target.value);
});


// ==========================================
// NORMALIZAÇÃO DOS CAMPOS
// ==========================================

campoEmail.addEventListener('input', (event) => {
    event.target.value = event.target.value.toLowerCase().trim();
});

['nome', 'cidade'].forEach(id => {
    const campo = document.getElementById(id);

    campo.addEventListener('blur', () => {
        campo.value = campo.value.replace(/\s+/g, ' ').trim();
    });
});


// ==========================================
// PEGAR DADOS DO FORMULÁRIO
// ==========================================

const pegarDadosFormulario = () => {
    return {
        nome: document.getElementById('nome').value.trim(),
        email: campoEmail.value.trim().toLowerCase(),

        celular: campoCelular.value.replace(/\D/g, ''),

        logradouro: '',
        bairro: '',

        cidade: document.getElementById('cidade').value.trim(),
        estado: document.getElementById('estado').value,

        cep: campoCep.value.replace(/\D/g, '')
    };
};


// ==========================================
// VALIDAR DADOS
// ==========================================

const validarAluno = (aluno) => {
    if (!aluno.nome) {
        throw new Error('Informe o nome do aluno.');
    }

    if (
        aluno.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(aluno.email)
    ) {
        throw new Error('Informe um e-mail válido.');
    }

    if (
        aluno.celular &&
        ![10, 11].includes(aluno.celular.length)
    ) {
        throw new Error('Informe um celular válido com DDD.');
    }

    if (aluno.cep && aluno.cep.length !== 8) {
        throw new Error('O CEP deve possuir 8 números.');
    }
};


// ==========================================
// PROTEGER TEXTO HTML
// ==========================================

const escaparHTML = (valor) => {
    return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caractere]);
};


// ==========================================
// CARREGAR ALUNOS DA API
// ==========================================

const carregarAlunos = async () => {
    tabela.innerHTML = `
        <tr>
            <td colspan="6">Carregando alunos...</td>
        </tr>
    `;

    mensagemErro.style.display = 'none';

    try {
        const resposta = await getAlunos();

        alunos = Array.isArray(resposta)
            ? resposta
            : Array.isArray(resposta?.alunos)
                ? resposta.alunos
                : [];

        renderizarAlunos();

    } catch (error) {
        console.error('Erro ao carregar alunos:', error);

        alunos = [];
        tabela.innerHTML = '';

        mensagemVazia.style.display = 'none';
        mensagemErro.textContent =
            `Erro ao carregar os alunos: ${error.message}`;

        mensagemErro.style.display = 'block';
    }
};


// ==========================================
// RENDERIZAR TABELA
// ==========================================

const renderizarAlunos = () => {
    const termo = busca.value.toLowerCase().trim();

    const filtrados = alunos.filter(aluno => {
        return (
            String(aluno.nome || '').toLowerCase().includes(termo) ||
            String(aluno.email || '').toLowerCase().includes(termo)
        );
    });

    tabela.innerHTML = '';

    mensagemVazia.style.display =
        filtrados.length ? 'none' : 'block';

    filtrados.forEach(aluno => {
        const iniciais = String(aluno.nome || 'AL')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(nome => nome[0])
            .join('')
            .toUpperCase();

        const cidadeEstado = [
            aluno.cidade,
            aluno.estado
        ].filter(Boolean).join(' ');

        const linha = document.createElement('tr');

        linha.innerHTML = `
            <td>
                <div class="student-info">
                    <div class="avatar">
                        ${escaparHTML(iniciais)}
                    </div>

                    <div>
                        <strong>${escaparHTML(aluno.nome)}</strong>
                        <small>Cadastro #${escaparHTML(aluno.id)}</small>
                    </div>
                </div>
            </td>

            <td>
                ${escaparHTML(aluno.email || 'Não informado')}
            </td>

            <td>
                ${escaparHTML(
                    aluno.celular
                        ? formatarCelular(aluno.celular)
                        : 'Não informado'
                )}
            </td>

            <td>
                ${escaparHTML(cidadeEstado || 'Não informado')}
            </td>

            <td>
                ${escaparHTML(
                    aluno.cep
                        ? formatarCEP(aluno.cep)
                        : 'Não informado'
                )}
            </td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="btn-edit"
                        data-action="editar"
                        data-id="${escaparHTML(aluno.id)}">
                        ✎ Editar
                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        data-action="excluir"
                        data-id="${escaparHTML(aluno.id)}">
                        ▢ Excluir
                    </button>

                </div>
            </td>
        `;

        tabela.appendChild(linha);
    });
};


// ==========================================
// LIMPAR FORMULÁRIO
// ==========================================

const limparFormulario = () => {
    form.reset();

    campoId.value = '';

    botaoSalvar.textContent = 'Salvar';
};


// ==========================================
// CADASTRAR / ATUALIZAR ALUNO
// ==========================================

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (botaoSalvar.disabled) return;

    const aluno = pegarDadosFormulario();

    try {
        validarAluno(aluno);

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = 'Salvando...';

        if (campoId.value) {
            aluno.id = campoId.value;

            await putAluno(aluno);

            alert('Aluno atualizado com sucesso!');
        } else {
            await postAluno(aluno);

            alert('Aluno cadastrado com sucesso!');
        }

        limparFormulario();

        await carregarAlunos();

    } catch (error) {
        console.error('Erro ao salvar:', error);

        alert(`Não foi possível salvar: ${error.message}`);

    } finally {
        botaoSalvar.disabled = false;

        botaoSalvar.textContent = campoId.value
            ? 'Atualizar'
            : 'Salvar';
    }
});


// ==========================================
// EDITAR ALUNO
// ==========================================

const editarAluno = async (id) => {
    try {
        const aluno = await getAluno(id);

        campoId.value = aluno.id;

        document.getElementById('nome').value = aluno.nome || '';
        campoEmail.value = aluno.email || '';

        campoCelular.value = formatarCelular(aluno.celular || '');

        document.getElementById('cidade').value = aluno.cidade || '';
        document.getElementById('estado').value = aluno.estado || '';

        campoCep.value = formatarCEP(aluno.cep || '');

        botaoSalvar.textContent = 'Atualizar';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);

        alert(`Não foi possível buscar o aluno: ${error.message}`);
    }
};


// ==========================================
// EXCLUIR ALUNO
// ==========================================

const excluirAluno = async (id) => {
    const confirmar = confirm(
        'Deseja realmente excluir este aluno?'
    );

    if (!confirmar) return;

    try {
        await deleteAluno(id);

        alert('Aluno excluído com sucesso!');

        await carregarAlunos();

    } catch (error) {
        console.error('Erro ao excluir:', error);

        alert(`Não foi possível excluir: ${error.message}`);
    }
};


// ==========================================
// EVENTOS DA TABELA
// ==========================================

tabela.addEventListener('click', async (event) => {
    const botao = event.target.closest('button');

    if (!botao) return;

    const id = botao.dataset.id;
    const acao = botao.dataset.action;

    if (acao === 'editar') {
        await editarAluno(id);
    }

    if (acao === 'excluir') {
        await excluirAluno(id);
    }
});


// ==========================================
// PESQUISA
// ==========================================

busca.addEventListener('input', renderizarAlunos);


// ==========================================
// LIMPAR
// ==========================================

document.getElementById('clearButton')
    .addEventListener('click', limparFormulario);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarAlunos();