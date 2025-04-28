let linhas, colunas, bombas, matriz, tabela;
let xLabels = [], yLabels = [];
let xStart, yStart;

function gerarMatriz(l, c) {
    matriz = [];
    for (let i = 0; i < l; i++) {
        matriz[i] = Array(c).fill(0);
    }
}

function gerarLabels() {
    xStart = -Math.floor(colunas / 2);
    xLabels = [];
    for (let j = 0; j < colunas; j++) {
        xLabels.push(xStart + j);
    }
    yStart = Math.floor(linhas / 2);
    yLabels = [];
    for (let i = 0; i < linhas; i++) {
        yLabels.push(yStart - i);
    }
}

function gerarTabela(l, c) {
    gerarMatriz(l, c);
    gerarLabels();

    let html = "<tr><td></td>";
    xLabels.forEach(x => {
        html += `<th class="${x === 0 ? 'axis-label axis' : 'axis-label'}">${x}</th>`;
    });
    html += "</tr>";

    for (let i = 0; i < linhas; i++) {
        const y = yLabels[i];
        html += `<tr><th class="${y === 0 ? 'axis-label axis' : 'axis-label'}">${y}</th>`;
        for (let j = 0; j < colunas; j++) {
            let classes = ['cell', 'blocked'];
            if (xLabels[j] === 0) classes.push('axis-vertical');
            if (y === 0) classes.push('axis-horizontal');
            html += `<td class="${classes.join(' ')}" data-i="${i}" data-j="${j}"></td>`;
        }
        html += `</tr>`;
    }

    tabela.innerHTML = html;
}

function gerarBombas() {
    let colocadas = 0;
    while (colocadas < bombas) {
        const i = Math.floor(Math.random() * linhas);
        const j = Math.floor(Math.random() * colunas);
        if (matriz[i][j] === 0) {
            matriz[i][j] = -1;
            colocadas++;
        }
    }
}

function gerarNumero(li, co) {
    let cnt = 0;
    for (let i = li - 1; i <= li + 1; i++) {
        for (let j = co - 1; j <= co + 1; j++) {
            if (
                i >= 0 && i < linhas &&
                j >= 0 && j < colunas &&
                matriz[i][j] === -1
            ) cnt++;
        }
    }
    matriz[li][co] = cnt;
}

function gerarNumeros() {
    for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
            if (matriz[i][j] !== -1) gerarNumero(i, j);
        }
    }
}

function revelarCelula(i, j) {
    const cell = tabela.rows[i + 1].cells[j + 1];
    if (matriz[i][j] === -1) {
        cell.innerHTML = "💣";
        cell.classList.add('revealed');
        return false;
    }
    if (matriz[i][j] === 0) {
        limparCelulas(i, j);
    } else {
        cell.innerHTML = matriz[i][j];
        cell.classList.add('n' + matriz[i][j], 'revealed');
    }
    return true;
}

function limparCelulas(li, co) {
    for (let i = li - 1; i <= li + 1; i++) {
        for (let j = co - 1; j <= co + 1; j++) {
            if (i >= 0 && i < linhas && j >= 0 && j < colunas) {
                const cell = tabela.rows[i + 1].cells[j + 1];
                if (!cell.classList.contains('revealed')) {
                    if (matriz[i][j] === 0) {
                        cell.classList.add('revealed');
                        limparCelulas(i, j);
                    } else if (matriz[i][j] > 0) {
                        cell.innerHTML = matriz[i][j];
                        cell.classList.add('n' + matriz[i][j], 'revealed');
                    }
                }
            }
        }
    }
}

function toggleFlag(i, j) {
    const cell = tabela.rows[i + 1].cells[j + 1];
    if (cell.classList.contains('revealed')) return;
    if (!cell.classList.contains('flag')) {
        cell.classList.remove('blocked');
        cell.classList.add('flag');
        cell.innerHTML = "🚩";
    } else {
        cell.classList.remove('flag');
        cell.classList.add('blocked');
        cell.innerHTML = "";
    }
}

function mostrarBombas() {
    for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
            if (matriz[i][j] === -1) {
                const cell = tabela.rows[i + 1].cells[j + 1];
                cell.innerHTML = "💣";
                cell.classList.add('revealed');
            }
        }
    }
}

function fimDeJogo(venceu) {
    document.getElementById('jogar').disabled = true;
    if (!venceu) {
        mostrarBombas();
        alert("Você perdeu!");
    } else {
        alert("Você venceu!");
    }
}

function jogar() {
    const x = parseInt(document.getElementById('inputX').value, 10);
    const y = parseInt(document.getElementById('inputY').value, 10);
    const action = document.getElementById('acao').value;

    const i = yStart - y;
    const j = x - xStart;

    if (i < 0 || i >= linhas || j < 0 || j >= colunas) {
        alert("Coordenada fora do plano!");
        return;
    }

    if (action === 'revelar') {
        if (!revelarCelula(i, j)) {
            fimDeJogo(false);
            return;
        }
        // checa vitória: todas células não-bomba reveladas
        const restantes = Array.from(
            document.querySelectorAll('td.cell.blocked')
        ).filter(td => !td.classList.contains('revealed')).length;
        if (restantes === bombas) fimDeJogo(true);

    } else { // bandeira
        toggleFlag(i, j);
    }
}

function init() {
    tabela = document.getElementById('tabela');
    document.getElementById('jogar').disabled = false;

    const diff = parseInt(document.getElementById('dificuldade').value, 10);
    if (diff === 0)      { linhas = 9;  colunas = 9;  bombas = 10; }
    else if (diff === 1) { linhas = 16; colunas = 16; bombas = 40; }
    else                 { linhas = 16; colunas = 30; bombas = 99; }

    gerarTabela(linhas, colunas);
    gerarBombas();
    gerarNumeros();
}

window.onload = () => {
    init();
    document.getElementById('dificuldade').onchange = init;
    document.getElementById('jogar').onclick = jogar;
};
