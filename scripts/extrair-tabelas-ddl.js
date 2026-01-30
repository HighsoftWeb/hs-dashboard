const fs = require('fs');
const path = require('path');

const ddlPath = '/Users/richardfarias/Downloads';
const outputPath = path.join(__dirname, '../docs/catalogo-tabelas-completo.json');

const tabelas = [];
const relacionamentos = [];

function extrairTabela(linha, linhas, index) {
  const match = linha.match(/CREATE TABLE dbo\.(\w+)/i);
  if (!match) return null;
  
  const nomeTabela = match[1];
  const colunas = [];
  let pk = null;
  let fks = [];
  let dentroTabela = true;
  let dentroPK = false;
  let dentroFK = false;
  let i = index + 1;
  
  while (i < linhas.length && dentroTabela) {
    const linhaAtual = linhas[i].trim();
    
    if (linhaAtual.startsWith('CONSTRAINT') && linhaAtual.includes('PRIMARY KEY')) {
      dentroPK = true;
      const pkMatch = linhaAtual.match(/\(([^)]+)\)/);
      if (pkMatch) {
        pk = pkMatch[1].split(',').map(c => c.trim());
      }
    }
    
    if (linhaAtual.includes('FOREIGN KEY') || linhaAtual.includes('REFERENCES')) {
      dentroFK = true;
      const fkMatch = linhaAtual.match(/REFERENCES dbo\.(\w+)/i);
      if (fkMatch) {
        fks.push(fkMatch[1]);
      }
    }
    
    if (linhaAtual.match(/^\w+\s+\w+/)) {
      const colMatch = linhaAtual.match(/^(\w+)\s+([^(]+)/);
      if (colMatch) {
        const nomeCol = colMatch[1];
        const tipo = colMatch[2].trim();
        const nullable = linhaAtual.includes('NULL');
        const notNull = linhaAtual.includes('NOT NULL');
        
        colunas.push({
          nome: nomeCol,
          tipo: tipo,
          nullable: nullable && !notNull,
          notNull: notNull
        });
      }
    }
    
    if (linhaAtual === ')' || linhaAtual.startsWith(') ON')) {
      dentroTabela = false;
    }
    
    i++;
  }
  
  return {
    nome: nomeTabela,
    colunas: colunas,
    pk: pk,
    fks: fks
  };
}

function processarDDL(arquivo) {
  const conteudo = fs.readFileSync(arquivo, 'utf-8');
  const linhas = conteudo.split('\n');
  
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.includes('CREATE TABLE dbo.')) {
      const tabela = extrairTabela(linha, linhas, i);
      if (tabela) {
        tabelas.push(tabela);
      }
    }
  }
}

const arquivosDDL = [];
for (let i = 1; i <= 17; i++) {
  const arquivo = path.join(ddlPath, `DDLsql_part_${String(i).padStart(2, '0')}.sql`);
  if (fs.existsSync(arquivo)) {
    arquivosDDL.push(arquivo);
  }
}

arquivosDDL.forEach(arquivo => {
  console.log(`Processando ${path.basename(arquivo)}...`);
  processarDDL(arquivo);
});

const resultado = {
  totalTabelas: tabelas.length,
  tabelas: tabelas.sort((a, b) => a.nome.localeCompare(b.nome)),
  geradoEm: new Date().toISOString()
};

fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2), 'utf-8');
console.log(`\n✅ Processadas ${tabelas.length} tabelas`);
console.log(`📄 Resultado salvo em: ${outputPath}`);
