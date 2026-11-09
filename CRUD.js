const BASE_URL = 'https://lion-school-phbo.onrender.com/alunos';

const getAlunos = async () => {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data;
};
/*
  Uso: A função não recebe parâmetros e retorna uma Promise com a lista de todos os alunos.
  Basta chamar a função e tratar o retorno conforme a necessidade da sua aplicação.
*/

const getAluno = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  const data = await res.json();
  return data;
};
/*
  Uso: A função recebe o ID do aluno como parâmetro e retorna uma Promise com os dados desse aluno específico.
*/


const postAluno = async (aluno) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(aluno)
  };

  const response = await fetch(BASE_URL, options);
  const data = await response.json();
  return data;
};
/*
  Uso: Para usar, basta criar um objeto com os dados do novo aluno (sem o ID, pois o backend gera) 
  e enviá-lo como argumento para a função.

  const novoAluno = {
    nome: "Cleyde Gomes da Silva",
    email: "cleydegomes@gmail.com",
    celular: "1199988888",
    logradouro: "rua sem fim",
    bairro: "Sem nome",
    cidade: "Barueri",
    estado: "SP",
    cep: "18135300"
  };
  
  createAluno(novoAluno);
*/


const putAluno = async (aluno) => {
  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(aluno)
  };

  const response = await fetch(`${BASE_URL}/${aluno.id}`, options);
  const data = await response.json();
  return data;
};
/*
  Uso: Para usar, crie um objeto contendo obrigatoriamente a propriedade 'id' e os campos que deseja atualizar.
  Envie esse objeto como argumento para a função.

  const alunoAtualizado = {
    id: "5",
    nome: "Cleyde Gomes da Silva",
    email: "cleydegomes@gmail.com"
  };
  
  putAluno(alunoAtualizado);
*/

const deleteAluno = async (id) => {
  const options = {
    method: 'DELETE'
  };

  const res = await fetch(`${BASE_URL}/${id}`, options);
  const data = await res.json();
  return data;
};
/*
  Uso: A função recebe apenas o ID do aluno que deseja remover como parâmetro.
  
  deleteAluno(5);
*/