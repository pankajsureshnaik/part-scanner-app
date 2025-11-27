document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const processButton = document.getElementById('processButton');
    const imageUploader = document.getElementById('imageUploader');
    const statusElement = document.getElementById('status');
    const tableBody = document.querySelector("#resultsTable tbody");
    const searchInput = document.getElementById('searchInput');
    const exportCsvButton = document.getElementById('exportCsvButton');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const startScannerBtn = document.getElementById('startScannerBtn');
    const stopScannerBtn = document.getElementById('stopScannerBtn');
    const qrReaderElement = document.getElementById('qr-reader');

    // --- DATA STORAGE ---
    let partDatabase = JSON.parse(localStorage.getItem('partDatabase')) || [];
    const saveData = () => {
        localStorage.setItem('partDatabase', JSON.stringify(partDatabase));
    };

    // =================================================================
    // SECTION 1: HIGH-PERFORMANCE OCR WORKER
    // =================================================================
    let tesseractWorker = null;

    async function initializeOcrWorker() {
        tesseractWorker = await Tesseract.createWorker('eng', 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    statusElement.textContent = `Recognizing: ${Math.round(m.progress * 100)}%`;
                } else {
                    statusElement.textContent = m.status;
                }
            },
        });
        processButton.disabled = false;
        statusElement.textContent = 'Ready to process an image.';
    }

    // Initialize the background worker as soon as the page loads
    initializeOcrWorker();

    processButton.addEventListener('click', async () => {
        const file = imageUploader.files[0];
        if (!file) { statusElement.textContent = 'Please select an image.'; return; }
        if (!tesseractWorker) { statusElement.textContent = 'OCR Engine not ready.'; return; }
        
        processButton.disabled = true;
        
        // Use the worker for recognition (this happens in the background)
        const { data: { text } } = await tesseractWorker.recognize(file);
        
        statusElement.textContent = 'Extracting details...';
        const details = parseTextFromOcr(text);
        const newPart = createPartObject(details, text);
        
        partDatabase.unshift(newPart);
        saveData();
        renderTable(); // Use the new, optimized render function
        statusElement.textContent = 'Part added successfully!';
        processButton.disabled = false;
    });
    
    // (The parseTextFromOcr function is unchanged, it's already efficient enough)
    function parseTextFromOcr(rawText) { /* ... same as before ... */ return details; }


    // =================================================================
    // SECTION 2: OPTIMIZED TABLE RENDERING
    // =================================================================
    const renderTable = (filter = '') => {
        // Create a DocumentFragment to build the new table body in memory
        const fragment = document.createDocumentFragment();
        
        const filteredData = partDatabase.filter(part =>
            Object.values(part).some(val => val.toString().toLowerCase().includes(filter.toLowerCase()))
        );

        filteredData.forEach(part => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${part.date}</td>
                <td>${part.partNo}</td>
                <td>${part.manufacturer}</td>
                <td>${part.serialNumber || 'N/A'}</td>
                <td>${part.specs}</td>
                <td>${part.category}</td>
                <td><input type="text" class="user-input" data-id="${part.id}" data-field="storeCode" value="${part.storeCode || ''}"></td>
                <td><input type="text" class="user-input" data-id="${part.id}" data-field="notes" value="${part.notes || ''}"></td>
                <td><pre>${part.rawData || ''}</pre></td>
            `;
            fragment.appendChild(row);
        });

        // Clear the existing table body and append the new one in a single operation
        tableBody.innerHTML = '';
        tableBody.appendChild(fragment);
    };

    // =================================================================
    // SECTION 3: EVENT LISTENERS & OTHER FUNCTIONS
    // =================================================================
    
    // New "Clear Data" button functionality
    clearDataBtn.addEventListener('click', () => {
        // Confirm with the user to prevent accidental deletion
        if (confirm('Are you sure you want to delete all logged parts? This action cannot be undone.')) {
            partDatabase = []; // Empty the array
            localStorage.removeItem('partDatabase'); // Clear from storage
            renderTable(); // Re-render the empty table
            alert('All logged data has been cleared.');
        }
    });
    
    // (All other functions like barcode scanning, search, CSV export, and table edits are unchanged)
    // --- Barcode Scanner Logic (unchanged) ---
    // --- CSV Export Logic (unchanged, it is already robust) ---
    // --- Search and Table Input Listeners (unchanged) ---

    // Initial load
    renderTable();
    
    // NOTE: For brevity, the unchanged functions are commented out. 
    // You should copy the full script.js from the previous response and only replace the `renderTable` and add the `clearDataBtn` listener and OCR worker parts. 
    // Or, for simplicity, here is the full script again.
});

// For your convenience, here is the full, final script.js again, not condensed.
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const processButton = document.getElementById('processButton');
    const imageUploader = document.getElementById('imageUploader');
    const statusElement = document.getElementById('status');
    const tableBody = document.querySelector("#resultsTable tbody");
    const searchInput = document.getElementById('searchInput');
    const exportCsvButton = document.getElementById('exportCsvButton');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const startScannerBtn = document.getElementById('startScannerBtn');
    const stopScannerBtn = document.getElementById('stopScannerBtn');
    const qrReaderElement = document.getElementById('qr-reader');

    // --- DATA STORAGE ---
    let partDatabase = JSON.parse(localStorage.getItem('partDatabase')) || [];
    const saveData = () => localStorage.setItem('partDatabase', JSON.stringify(partDatabase));

    // --- SECTION 1: HIGH-PERFORMANCE OCR WORKER ---
    let tesseractWorker = null;
    async function initializeOcrWorker() {
        statusElement.textContent = 'Initializing OCR Engine...';
        tesseractWorker = await Tesseract.createWorker('eng', 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    statusElement.textContent = `Recognizing: ${Math.round(m.progress * 100)}%`;
                } else if (m.status !== 'done') {
                    statusElement.textContent = m.status;
                }
            },
        });
        processButton.disabled = false;
        statusElement.textContent = 'Ready to process an image.';
    }
    initializeOcrWorker();

    processButton.addEventListener('click', async () => {
        const file = imageUploader.files[0];
        if (!file) { statusElement.textContent = 'Please select an image.'; return; }
        if (!tesseractWorker) { statusElement.textContent = 'OCR Engine not ready.'; return; }
        processButton.disabled = true;
        const { data: { text } } = await tesseractWorker.recognize(file);
        statusElement.textContent = 'Extracting details...';
        const details = parseTextFromOcr(text);
        const newPart = createPartObject(details, text);
        partDatabase.unshift(newPart);
        saveData();
        renderTable();
        statusElement.textContent = 'Part added successfully!';
        processButton.disabled = false;
    });
    
    function parseTextFromOcr(rawText) {
        const details = { partNo: 'Not Found', manufacturer: 'Not Found', specs: 'N/A', category: 'Uncategorized', serialNumber: 'N/A' };
        const lowerCaseText = rawText.toLowerCase();
        const manuKeywords = ['beckhoff', 'schneider', 'puls', 'siemens', 'skf', 'fag', 'nsk', 'timken', 'telemecanique'];
        details.manufacturer = manuKeywords.find(m => lowerCaseText.includes(m)) || 'Not Found';
        let serialMatch = rawText.match(/Ser\.Nr\.:?\s*(\S+)/i);
        if (serialMatch) details.serialNumber = serialMatch[1];
        let bearingMatch = rawText.match(/\b(\d{4,5}(?:-?2RS|-?ZZ)?)\b/i);
        if (bearingMatch && (lowerCaseText.includes('bearing') || ['skf', 'fag', 'nsk', 'timken'].includes(details.manufacturer))) {
            details.partNo = bearingMatch[0].toUpperCase();
            details.category = 'Bearing';
        } else if (lowerCaseText.includes('hose') || lowerCaseText.includes('dn') || lowerCaseText.includes('pn')) {
            details.category = 'Hose / Fitting';
            let hosePartMatch = rawText.match(/\b([A-Z0-9-]{6,})\b/);
            if(hosePartMatch) details.partNo = hosePartMatch[0];
        } else {
            const partNoPatterns = [ /\b(EK\d{4})\b/i, /\b(QS\d{1,2}\.\d{3})\b/i, /\b\d{4}\s\d{3}\s\d{2}\s\d{2}\b/, /\b3RT[A-Z0-9-]+\b/i, /\b([A-Z]{2,3}\d{2,}[A-Z0-9-]*)\b/i ];
            for (const pattern of partNoPatterns) {
                const match = rawText.match(pattern);
                if (match) { details.partNo = match[0]; break; }
            }
        }
        const specPatterns = [ /\b\d+[\.,]?\d*\s*(V|A|KW|HZ|°C|DC)\b/gi, /\b(DN\s*\d+|PN\s*\d+)\b/gi, /\b(\d+\s*bar|\d+\s*psi)\b/gi ];
        let allSpecs = [];
        specPatterns.forEach(pattern => {
            const matches = rawText.match(pattern);
            if (matches) { allSpecs = allSpecs.concat(matches); }
        });
        if (allSpecs.length > 0) details.specs = [...new Set(allSpecs)].join(', ');
        if (details.category === 'Uncategorized') {
             if (lowerCaseText.includes('power supply')) details.category = 'Power Supply';
             else if (lowerCaseText.includes('junction') || lowerCaseText.includes('ethercat')) details.category = 'Network Module';
             else if (lowerCaseText.includes('contactor') || lowerCaseText.includes('man-mtr-cntlr')) details.category = 'Contactor';
             else if (details.specs.includes('V') || details.specs.includes('A')) details.category = 'Electrical';
        }
        return details;
    }

    // --- SECTION 2: OPTIMIZED TABLE RENDERING ---
    const renderTable = (filter = '') => {
        const fragment = document.createDocumentFragment();
        const filteredData = partDatabase.filter(part => Object.values(part).some(val => val.toString().toLowerCase().includes(filter.toLowerCase())));
        filteredData.forEach(part => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${part.date}</td><td>${part.partNo}</td><td>${part.manufacturer.toUpperCase()}</td><td>${part.serialNumber || 'N/A'}</td><td>${part.specs}</td><td>${part.category}</td><td><input type="text" class="user-input" data-id="${part.id}" data-field="storeCode" value="${part.storeCode || ''}"></td><td><input type="text" class="user-input" data-id="${part.id}" data-field="notes" value="${part.notes || ''}"></td><td><pre>${part.rawData || ''}</pre></td>`;
            fragment.appendChild(row);
        });
        tableBody.innerHTML = '';
        tableBody.appendChild(fragment);
    };

    // --- SECTION 3: OTHER FUNCTIONS & EVENT LISTENERS ---
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all logged parts? This action cannot be undone.')) {
            partDatabase = [];
            localStorage.removeItem('partDatabase');
            renderTable();
            alert('All logged data has been cleared.');
        }
    });

    const html5QrcodeScanner = new Html5Qrcode("qr-reader");
    const onScanSuccess = (decodedText) => {
        alert(`Scanned Part Number: ${decodedText}`);
        const newPart = createPartObject({ partNo: decodedText }, `Scanned Barcode: ${decodedText}`);
        partDatabase.unshift(newPart);
        saveData();
        renderTable();
        stopScanner();
    };
    const startScanner = () => {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        qrReaderElement.style.display = 'block';
        startScannerBtn.style.display = 'none';
        stopScannerBtn.style.display = 'inline-block';
        html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess).catch(err => { alert("Could not start camera."); stopScanner(); });
    };
    const stopScanner = () => {
        html5QrcodeScanner.stop().then(() => {
            qrReaderElement.style.display = 'none';
            startScannerBtn.style.display = 'inline-block';
            stopScannerBtn.style.display = 'none';
        }).catch(err => console.error("Error stopping scanner."));
    };
    startScannerBtn.addEventListener('click', startScanner);
    stopScannerBtn.addEventListener('click', stopScanner);

    const createPartObject = (details, rawText) => ({ id: Date.now(), date: new Date().toLocaleDateString(), partNo: details.partNo || 'N/A', manufacturer: details.manufacturer || 'N/A', serialNumber: details.serialNumber || 'N/A', specs: details.specs || 'N/A', category: details.category || 'Uncategorized', storeCode: '', notes: '', rawData: rawText || 'N/A' });
    searchInput.addEventListener('input', (e) => renderTable(e.target.value));
    tableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('user-input')) {
            const id = Number(e.target.dataset.id);
            const field = e.target.dataset.field;
            const value = e.target.value;
            const partIndex = partDatabase.findIndex(p => p.id === id);
            if (partIndex > -1) { partDatabase[partIndex][field] = value; saveData(); }
        }
    });

    exportCsvButton.addEventListener('click', () => {
        const formatCsvField = (field) => {
            const value = (field === null || field === undefined) ? '' : String(field);
            const sanitizedValue = value.replace(/(\r\n|\n|\r)/gm, " ");
            const escapedValue = sanitizedValue.replace(/"/g, '""');
            return `"${escapedValue}"`;
        };
        const headers = ['Date', 'Part No', 'Manufacturer', 'Serial Nr.', 'Specs', 'Category', 'Store Code', 'Notes', 'Raw Extracted Data'];
        const rows = partDatabase.map(part => [formatCsvField(part.date), formatCsvField(part.partNo), formatCsvField(part.manufacturer), formatCsvField(part.serialNumber), formatCsvField(part.specs), formatCsvField(part.category), formatCsvField(part.storeCode), formatCsvField(part.notes), formatCsvField(part.rawData)].join(','));
        const csvContent = [headers.join(','), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `spare_parts_log_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    renderTable();
});