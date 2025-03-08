// Configurações
const MAX_PRICE = 25.0;  // Preço máximo para filtrar FIIs
const UPDATE_INTERVAL = 4 * 60 * 60 * 1000;  // Atualizar a cada 4 horas (3x ao dia)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;  // Cache expira em 24 horas

// Lista de FIIs para monitorar
const FIIS_TO_TRACK = [
    'MXRF11', 'KNCR11', 'HGLG11', 'VISC11', 'XPLG11', 
    'HGRE11', 'XPML11', 'RECT11', 'BCFF11', 'IRDM11',
    'HFOF11', 'RZTR11', 'VGIP11', 'KNRI11', 'RBRR11',
    'VINO11', 'VILG11', 'HCTR11', 'VRTA11', 'HSML11',
    'BTLG11', 'RBRF11', 'VGHF11', 'RVBI11', 'XPCI11',
    'HGBS11', 'RECR11', 'BRCR11', 'TRXF11', 'TGAR11'
];

// Mapeamento de segmentos
const SEGMENTS = {
    'MXRF11': 'Recebíveis', 'KNCR11': 'Recebíveis', 'HGLG11': 'Logístico',
    'VISC11': 'Shopping', 'XPLG11': 'Logístico', 'HGRE11': 'Escritórios',
    'XPML11': 'Shopping', 'RECT11': 'Recebíveis', 'BCFF11': 'Fundo de Fundos',
    'IRDM11': 'Recebíveis', 'HFOF11': 'Fundo de Fundos', 'RZTR11': 'Recebíveis',
    'VGIP11': 'Recebíveis', 'KNRI11': 'Híbrido', 'RBRR11': 'Recebíveis',
    'VINO11': 'Híbrido', 'VILG11': 'Logístico', 'HCTR11': 'Recebíveis',
    'VRTA11': 'Recebíveis', 'HSML11': 'Shopping', 'BTLG11': 'Logístico',
    'RBRF11': 'Fundo de Fundos', 'VGHF11': 'Fundo de Fundos', 'RVBI11': 'Recebíveis',
    'XPCI11': 'Recebíveis', 'HGBS11': 'Shopping', 'RECR11': 'Recebíveis',
    'BRCR11': 'Escritórios', 'TRXF11': 'Recebíveis', 'TGAR11': 'Logístico'
};

// Dados de vacância (exemplo - você precisará atualizar com dados reais)
const VACANCY_DATA = {
    'HGLG11': 3.2, 'XPLG11': 2.9, 'HGRE11': 12.8, 'VISC11': 5.1,
    'XPML11': 4.8, 'KNRI11': 7.2, 'HSML11': 3.9, 'BTLG11': 0.5,
    'BRCR11': 15.3, 'HGBS11': 4.2, 'VILG11': 1.8
};

// Função principal que inicializa o dashboard
async function initDashboard() {
    updateLastUpdateTime();
    
    // Tenta carregar do cache primeiro
    const cachedData = loadFromCache();
    if (cachedData) {
        renderDashboard(cachedData);
    }
    
    // Busca dados atualizados
    try {
        const fiisData = await fetchFIIsData();
        saveToCache(fiisData);
        renderDashboard(fiisData);
    } catch (error) {
        console.error('Erro ao buscar dados dos FIIs:', error);
        // Se falhar e não tiver cache, mostra mensagem de erro
        if (!cachedData) {
            document.getElementById('fiis-data').innerHTML = 
                '<tr><td colspan="8">Erro ao carregar dados. Tente novamente mais tarde.</td></tr>';
        }
    }
    
    // Configura atualizações periódicas
    setInterval(async () => {
        try {
            const fiisData = await fetchFIIsData();
            saveToCache(fiisData);
            renderDashboard(fiisData);
            updateLastUpdateTime();
        } catch (error) {
            console.error('Erro na atualização automática:', error);
        }
    }, UPDATE_INTERVAL);
    
    // Configura eventos de filtro
    document.getElementById('segment').addEventListener('change', filterTable);
    document.getElementById('sort').addEventListener('change', sortTable);
}

// Função para buscar dados dos FIIs (simulada - você precisará implementar com APIs reais)
async function fetchFIIsData() {
    // Aqui você implementaria as chamadas reais para as APIs
    // Por enquanto, vamos usar dados simulados
    
    let fiisData = [];
    
    for (const ticker of FIIS_TO_TRACK) {
        // Dados simulados - substitua por chamadas de API reais
        const price = Math.random() * 20 + 5; // Preço entre 5 e 25
        const dy = Math.random() * 15 + 5; // DY entre 5% e 20%
        const lastDiv = (price * (Math.random() * 0.01 + 0.005)).toFixed(2); // Último dividendo
        const pvp = Math.random() * 0.3 + 0.7; // P/VP entre 0.7 e 1.0
        const fairPrice = (price * (Math.random() * 0.3 + 0.9)).toFixed(2); // Preço justo
        
        fiisData.push({
            ticker,
            segment: SEGMENTS[ticker] || 'Outros',
            price: price.toFixed(2),
            dy: dy.toFixed(1),
            lastDiv,
            pvp: pvp.toFixed(2),
            fairPrice,
            vacancy: VACANCY_DATA[ticker] || 'N/A'
        });
    }
    
    return fiisData;
}

// Função para renderizar o dashboard com os dados
function renderDashboard(fiisData) {
    renderTable(fiisData);
    renderCharts(fiisData);
    generateRecommendations(fiisData);
}

// Função para renderizar a tabela de FIIs
function renderTable(fiisData) {
    const tableBody = document.getElementById('fiis-data');
    tableBody.innerHTML = '';
    
    // Filtra FIIs com preço abaixo de MAX_PRICE
    const filteredData = fiisData.filter(fii => parseFloat(fii.price) < MAX_PRICE);
    
    // Ordena por DY (padrão)
    filteredData.sort((a, b) => parseFloat(b.dy) - parseFloat(a.dy));
    
    // Renderiza as linhas da tabela
    filteredData.forEach(fii => {
        const row = document.createElement('tr');
        
        // Destaca FIIs com preço abaixo do preço justo
        const isPriceGood = parseFloat(fii.price) < parseFloat(fii.fairPrice);
        if (isPriceGood) {
            row.classList.add('good-price');
        }
        
        row.innerHTML = `
            <td>${fii.ticker}</td>
            <td>${fii.segment}</td>
            <td>R$ ${fii.price}</td>
            <td>${fii.dy}%</td>
            <td>R$ ${fii.lastDiv} (${(parseFloat(fii.lastDiv) / parseFloat(fii.price) * 100).toFixed(2)}%)</td>
            <td>${fii.pvp}</td>
            <td>R$ ${fii.fairPrice}</td>
            <td>${fii.vacancy}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Função para atualizar o horário da última atualização
function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('last-update').textContent = 
        now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
}

// Funções de cache
function saveToCache(data) {
    const cacheData = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem('fiisCache', JSON.stringify(cacheData));
}

function loadFromCache() {
    const cacheJson = localStorage.getItem('fiisCache');
    if (!cacheJson) return null;
    
    const cache = JSON.parse(cacheJson);
    const now = Date.now();
    
    // Verifica se o cache expirou
    if (now - cache.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem('fiisCache');
        return null;
    }
    
    return cache.data;
}

// Funções de filtro e ordenação
function filterTable() {
    const segment = document.getElementById('segment').value;
    const rows = document.querySelectorAll('#fiis-table tbody tr');
    
    rows.forEach(row => {
        const rowSegment = row.children[1].textContent;
        if (segment === 'all' || rowSegment === segment) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function sortTable() {
    const sortBy = document.getElementById('sort').value;
    const tableBody = document.getElementById('fiis-data');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'dy':
                aValue = parseFloat(a.children[3].textContent);
                bValue = parseFloat(b.children[3].textContent);
                return bValue - aValue;
            case 'price':
                aValue = parseFloat(a.children[2].textContent.replace('R$ ', ''));
                bValue = parseFloat(b.children[2].textContent.replace('R$ ', ''));
                return aValue - bValue;
            case 'pvp':
                aValue = parseFloat(a.children[5].textContent);
                bValue = parseFloat(b.children[5].textContent);
                return aValue - bValue;
            case 'last_dividend':
                aValue = parseFloat(a.children[4].textContent.split(' ')[1]);
                bValue = parseFloat(b.children[4].textContent.split(' ')[1]);
                return bValue - aValue;
        }
    });
    
    // Limpa e readiciona as linhas na nova ordem
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}

// Inicializa o dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', initDashboard);
// Adicione ao final do arquivo main.js

// Função para exportar dados para CSV
function exportToCSV() {
    const table = document.getElementById('fiis-table');
    let csv = [];
    
    // Cabeçalhos
    const headers = [];
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(cell => {
        headers.push(cell.textContent);
    });
    csv.push(headers.join(','));
    
    // Dados
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            // Remove R$ e % para facilitar importação
            let text = cell.textContent.replace('R$ ', '').replace('%', '');
            // Adiciona aspas se tiver vírgula
            if (text.includes(',')) {
                text = `"${text}"`;
            }
            rowData.push(text);
        });
        csv.push(rowData.join(','));
    });
    
    // Cria arquivo para download
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Cria link para download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fiis-analise-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Adiciona botão de exportação
document.addEventListener('DOMContentLoaded', function() {
    const filtersSection = document.querySelector('.filters');
    
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Exportar para CSV';
    exportButton.className = 'export-button';
    exportButton.addEventListener('click', exportToCSV);
    
    filtersSection.appendChild(exportButton);
});
// Adicione ao final do arquivo main.js

// Sistema de alertas para oportunidades
function checkForAlerts(fiisData) {
    // Critérios para alertas
    const alerts = [];
    
    fiisData.forEach(fii => {
        const price = parseFloat(fii.price);
        const fairPrice = parseFloat(fii.fairPrice);
        const pvp = parseFloat(fii.pvp);
        const dy = parseFloat(fii.dy);
        
        // Alerta 1: Preço muito abaixo do justo
        if (price < fairPrice * 0.85) {
            alerts.push({
                type: 'opportunity',
                ticker: fii.ticker,
                message: `${fii.ticker} está negociando ${((fairPrice - price) / fairPrice * 100).toFixed(1)}% abaixo do preço justo`
            });
        }
        
        // Alerta 2: DY muito alto
        if (dy > 15) {
            alerts.push({
                type: 'high-yield',
                ticker: fii.ticker,
                message: `${fii.ticker} está com Dividend Yield de ${dy}%, acima da média do mercado`
            });
        }
        
        // Alerta 3: P/VP muito baixo
        if (pvp < 0.8) {
            alerts.push({
                type: 'discount',
                ticker: fii.ticker,
                message: `${fii.ticker} está com P/VP de ${pvp}, indicando possível desconto`
            });
        }
    });
    
    // Exibe alertas se houver
    if (alerts.length > 0) {
        displayAlerts(alerts);
    }
}

// Função para exibir alertas
function displayAlerts(alerts) {
    // Cria seção de alertas se não existir
    let alertsSection = document.querySelector('.alerts-section');
    if (!alertsSection) {
        alertsSection = document.createElement('section');
        alertsSection.className = 'alerts-section';
        alertsSection.innerHTML = '<h2>Alertas e Oportunidades</h2><div class="alerts-container"></div>';
        
        // Insere após os filtros
        const filtersSection = document.querySelector('.filters');
        filtersSection.parentNode.insertBefore(alertsSection, filtersSection.nextSibling);
    }
    
    const alertsContainer = alertsSection.querySelector('.alerts-container');
    alertsContainer.innerHTML = '';
    
    // Adiciona cada alerta
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alert.type}`;
        alertElement.innerHTML = `
            <span class="alert-ticker">${alert.ticker}</span>
            <span class="alert-message">${alert.message}</span>
        `;
        alertsContainer.appendChild(alertElement);
    });
}

// Modifica a função initDashboard para incluir verificação de alertas
async function initDashboard() {
    // Código existente...
    
    // Após renderizar o dashboard, verifica alertas
    try {
        const fiisData = await fetchFIIsData();
        // Código existente...
        checkForAlerts(fiisData);
    } catch (error) {
        console.error('Erro ao verificar alertas:', error);
    }
    
    // Código existente...
}
