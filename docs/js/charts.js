// Função para renderizar os gráficos
function renderCharts(fiisData) {
    renderSegmentChart(fiisData);
    renderDYChart(fiisData);
}

// Gráfico de distribuição por segmento
function renderSegmentChart(fiisData) {
    const ctx = document.getElementById('segment-chart').getContext('2d');
    
    // Conta FIIs por segmento
    const segmentCounts = {};
    fiisData.forEach(fii => {
        segmentCounts[fii.segment] = (segmentCounts[fii.segment] || 0) + 1;
    });
    
    // Prepara dados para o gráfico
    const labels = Object.keys(segmentCounts);
    const data = Object.values(segmentCounts);
    
   // Função para renderizar os gráficos
function renderCharts(fiisData) {
    renderSegmentChart(fiisData);
    renderDYChart(fiisData);
}

// Gráfico de distribuição por segmento
function renderSegmentChart(fiisData) {
    const ctx = document.getElementById('segment-chart').getContext('2d');
    
    // Conta FIIs por segmento
    const segmentCounts = {};
    fiisData.forEach(fii => {
        segmentCounts[fii.segment] = (segmentCounts[fii.segment] || 0) + 1;
    });
    
    // Prepara dados para o gráfico
    const labels = Object.keys(segmentCounts);
    const data = Object.values(segmentCounts);
    
    // Cores para os segmentos
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC249', '#EA526F'
    ];
    
    // Destrói gráfico anterior se existir
    if (window.segmentChart) {
        window.segmentChart.destroy();
    }
    
    // Cria novo gráfico
    window.segmentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Distribuição por Segmento'
                }
            }
        }
    });
}

// Gráfico de top 10 Dividend Yield
function renderDYChart(fiisData) {
    const ctx = document.getElementById('dy-chart').getContext('2d');
    
    // Ordena por DY e pega os top 10
    const topDY = [...fiisData]
        .sort((a, b) => parseFloat(b.dy) - parseFloat(a.dy))
        .slice(0, 10);
    
    // Prepara dados para o gráfico
    const labels = topDY.map(fii => fii.ticker);
    const data = topDY.map(fii => parseFloat(fii.dy));
    
    // Destrói gráfico anterior se existir
    if (window.dyChart) {
        window.dyChart.destroy();
    }
    
    // Cria novo gráfico
    window.dyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Dividend Yield (%)',
                data: data,
                backgroundColor: '#36A2EB',
                borderColor: '#2980B9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 10 FIIs por Dividend Yield'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'DY (%)'
                    }
                }
            }
        }
    });
}

// Função para gerar recomendações de compra
function generateRecommendations(fiisData) {
    const recommendationsDiv = document.getElementById('buy-recommendations');
    recommendationsDiv.innerHTML = '';
    
    // Filtra FIIs com bom potencial
    const goodBuys = fiisData.filter(fii => {
        const price = parseFloat(fii.price);
        const fairPrice = parseFloat(fii.fairPrice);
        const pvp = parseFloat(fii.pvp);
        const dy = parseFloat(fii.dy);
        
        // Critérios para recomendação
        return price < fairPrice && // Preço abaixo do justo
               pvp < 0.95 &&        // P/VP descontado
               dy > 10.0;           // DY atrativo
    });
    
    // Ordena por potencial de valorização
    goodBuys.sort((a, b) => {
        const potentialA = parseFloat(a.fairPrice) / parseFloat(a.price) - 1;
        const potentialB = parseFloat(b.fairPrice) / parseFloat(b.price) - 1;
        return potentialB - potentialA;
    });
    
    // Limita a 5 recomendações
    const topRecommendations = goodBuys.slice(0, 5);
    
    // Cria elementos HTML para as recomendações
    if (topRecommendations.length > 0) {
        const recommendationsList = document.createElement('ul');
        recommendationsList.className = 'recommendations-list';
        
        topRecommendations.forEach(fii => {
            const potential = (parseFloat(fii.fairPrice) / parseFloat(fii.price) - 1) * 100;
            
            const li = document.createElement('li');
            li.className = 'recommendation-item';
            li.innerHTML = `
                <div class="recommendation-ticker">${fii.ticker}</div>
                <div class="recommendation-details">
                    <p><strong>Segmento:</strong> ${fii.segment}</p>
                    <p><strong>Preço Atual:</strong> R$ ${fii.price}</p>
                    <p><strong>Preço Justo:</strong> R$ ${fii.fairPrice}</p>
                    <p><strong>Potencial:</strong> +${potential.toFixed(2)}%</p>
                    <p><strong>DY:</strong> ${fii.dy}%</p>
                    <p><strong>P/VP:</strong> ${fii.pvp}</p>
                </div>
            `;
            
            recommendationsList.appendChild(li);
        });
        
        recommendationsDiv.appendChild(recommendationsList);
    } else {
        recommendationsDiv.innerHTML = '<p>Nenhuma recomendação de compra encontrada com os critérios atuais.</p>';
    }
}