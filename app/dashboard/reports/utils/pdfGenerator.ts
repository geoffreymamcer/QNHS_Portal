import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const QNHS_BLUE: [number, number, number] = [30, 58, 138]; // Deep QNHS Blue

/**
 * Standard Header for all QNHS Reports
 */
const addReportHeader = (doc: jsPDF, title: string, subtitle?: string) => {
    const pageWidth = doc.internal.pageSize.width;

    // 1. School Logo (Centered)
    // Logo size: 22x22, centered at y=10
    try {
        doc.addImage('/qnhs_logo.png', 'PNG', (pageWidth - 22) / 2, 8, 22, 22);
    } catch (e) {
        console.error('Logo failed to load', e);
    }

    // 2. Headings
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Republic of the Philippines', pageWidth / 2, 38, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('QUEZON NATIONAL HIGH SCHOOL', pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Administration Office', pageWidth / 2, 51, { align: 'center' });

    // 3. Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 58, pageWidth - 20, 58);

    // 4. Report Title
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), pageWidth / 2, 72, { align: 'center' });

    if (subtitle) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'italic');
        doc.text(subtitle, pageWidth / 2, 79, { align: 'center' });
    }
};

/**
 * Standard Page Footer
 */
const addPageFooter = (doc: jsPDF, generatedAt: string) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(
            `Generated on: ${generatedAt} | QNHS Administration Office Portal`,
            20,
            pageHeight - 10
        );
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }
};

/**
 * Handle PDF output based on action
 */
const handleOutput = (doc: jsPDF, filename: string, action: 'download' | 'view') => {
    if (action === 'view') {
        const url = doc.output('bloburl');
        window.open(url, '_blank');
    } else {
        doc.save(filename);
    }
};

export const generateWorkforcePDF = (data: any, action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Workforce Summary Report',
        `Institutional Data as of ${new Date().toLocaleDateString()}`
    );

    autoTable(doc, {
        startY: 90,
        head: [['Metric', 'Value']],
        body: [
            ['Total Employees', data.total.toString()],
            ['Teaching Personnel', data.teaching.toString()],
            ['Non-Teaching Personnel', data.nonTeaching.toString()],
            ['Permanent Employees', data.permanent.toString()],
            ['Non-Permanent/Others', data.nonPermanent.toString()],
            ['Male Personnel', data.male.toString()],
            ['Female Personnel', data.female.toString()],
            ['Average Workforce Age', `${data.averageAge} years`],
            ['Total Monthly Salary Expenditure', `Php ${data.totalSalaryCost.toLocaleString()}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Workforce_Summary_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateStaffingPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Staffing Distribution Report',
        'Departmental Workforce Balance Analysis'
    );

    // Calculate Grand Totals
    const grandTeaching = data.reduce((sum, d) => sum + d.teaching, 0);
    const grandNonTeaching = data.reduce((sum, d) => sum + d.nonTeaching, 0);
    const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Department', 'Teaching', 'Non-Teaching', 'Total Personnel']],
        body: [
            ...data.map(d => [
                d.name,
                d.teaching.toString(),
                d.nonTeaching.toString(),
                d.total.toString()
            ]),
            [{ content: 'GRAND TOTAL', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: grandTeaching.toString(), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: grandNonTeaching.toString(), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: grandTotal.toString(), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Staffing_Distribution_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateStatusPDF = (data: any, action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Employment Status Summary',
        'HR Stability & Workforce Retention Indicator'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Employment Status', 'Count', 'Percentage']],
        body: [
            ...data.data.map((d: any) => [d.status, d.count.toString(), `${d.percentage}%`]),
            [{ content: 'TOTAL WORKFORCE', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: data.total.toString(), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: '100%', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]
        ],
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Employment_Status_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateSalaryPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Salary Expenditure Summary',
        'Financial Overview: Authorized vs Actual Salary Analysis'
    );

    // Calculate Grand Totals
    const totalAuth = data.reduce((sum, d) => sum + d.authorized, 0);
    const totalAct = data.reduce((sum, d) => sum + d.actual, 0);
    const totalVar = totalAuth - totalAct;

    const formatCurrency = (val: number) => `Php ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Department', 'Authorized', 'Actual', 'Variance']],
        body: [
            ...data.map(d => [
                d.department,
                formatCurrency(d.authorized),
                formatCurrency(d.actual),
                formatCurrency(d.variance)
            ]),
            [{ content: 'GRAND TOTAL', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: formatCurrency(totalAuth), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: formatCurrency(totalAct), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
            { content: formatCurrency(totalVar), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]
        ],
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 8, cellPadding: 3 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Salary_Expenditure_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generatePositionSGPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Position & Salary Grade Distribution',
        'Workforce Structure Analysis by Position Title and SG'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Position Title', 'Salary Grade', 'Number of Personnel']],
        body: data.map(d => [d.position, d.sg, d.count.toString()]),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    // Summary Statistics
    const totalPersonnel = data.reduce((sum, d) => sum + d.count, 0);
    const posCount = data.length;

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Unique Positions: ${posCount}`, 20, finalY);
    doc.text(`Total Personnel Count: ${totalPersonnel}`, 20, finalY + 7);

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Position_SG_Distribution_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateLicensePDF = (data: any, action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'License Compliance Summary',
        'Aggregated View of Professional License Expiration Health'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Expiration Year', 'Personnel Count', 'Expiring Key Personnel (Samples)']],
        body: data.data.map((d: any) => [
            d.year,
            d.count.toString(),
            d.sampleNames || 'None'
        ]),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 8, cellPadding: 4 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_License_Compliance_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateCSPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Civil Service Eligibility Distribution',
        'Workforce Mapping for Archival Audits and Compliance'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Eligibility Type', 'Number of Personnel', 'Percentage (%)']],
        body: data.map(d => {
            const total = data.reduce((sum, item) => sum + item.count, 0);
            const percentage = ((d.count / total) * 100).toFixed(1);
            return [d.type, d.count.toString(), `${percentage}%`];
        }),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_CS_Eligibility_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateVacancyPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Vacancy & Filled Position Tracking',
        'Plantilla Health Check & Recruitment Progress Analysis'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Department', 'Total Items', 'Filled', 'Vacant', 'Occupancy Rate (%)']],
        body: data.map(d => [
            d.department,
            d.total.toString(),
            d.filled.toString(),
            d.vacant.toString(),
            `${d.occupancyRate}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 8, cellPadding: 4 }
    });

    // Summary Analytics
    const totalItems = data.reduce((sum, d) => sum + d.total, 0);
    const totalFilled = data.reduce((sum, d) => sum + d.filled, 0);
    const totalVacant = data.reduce((sum, d) => sum + d.vacant, 0);
    const overallRate = totalItems > 0 ? ((totalFilled / totalItems) * 100).toFixed(1) : '0';

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ORGANIZATIONAL SUMMARY', 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Approved Plantilla Items: ${totalItems}`, 20, finalY + 7);
    doc.text(`Total Filled Positions: ${totalFilled}`, 20, finalY + 13);
    doc.text(`Total Vacant Slots: ${totalVacant} (Recruitment Needs)`, 20, finalY + 19);
    doc.text(`Overall Plantilla Occupancy Rate: ${overallRate}%`, 20, finalY + 25);

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Vacancy_Tracking_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateAgePDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Age Demographics Analysis',
        'Workforce Aging Report for Succession Planning and Retirement Forecasting'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Age Range', 'Personnel Count', 'Percentage (%)']],
        body: data.map(d => [
            d.range,
            d.count.toString(),
            `${d.percentage}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 9, cellPadding: 5 }
    });

    // Summary Analytics
    const totalPersonnel = data.reduce((sum, d) => sum + d.count, 0);
    const seniors = data.find(d => d.range === '60+')?.count || 0;
    const nearingRetirement = data.find(d => d.range === '50-59')?.count || 0;

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PLANNING INSIGHTS', 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Workforce Count: ${totalPersonnel}`, 20, finalY + 7);
    doc.text(`Personnel at Retirement Age (60+): ${seniors}`, 20, finalY + 13);
    doc.text(`Personnel Nearing Retirement (50-59): ${nearingRetirement}`, 20, finalY + 19);

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Age_Demographics_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateRetirementPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns
    const generatedAt = new Date().toLocaleString();

    addReportHeader(
        doc,
        'Retirement Projection Summary (10-Year Forecast)',
        'Personnel identified for upcoming mandatory (65) and optional (60) retirement'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Name of Personnel', 'Position', 'Department', 'Birthdate', 'Optional (60)', 'Mandatory (65)', 'Years Left']],
        body: data.map(d => [
            d.name,
            d.position,
            d.department,
            d.birthdate,
            d.optionalRetirementYear.toString(),
            d.mandatoryRetirementYear.toString(),
            d.yearsToMandatory.toString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 8, cellPadding: 3 }
    });

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Retirement_Projection_${new Date().toISOString().split('T')[0]}.pdf`, action);
};

export const generateMovementPDF = (data: any[], action: 'download' | 'view' = 'download') => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();
    const currentYear = new Date().getFullYear();

    addReportHeader(
        doc,
        `Workforce Movement Summary - CY ${currentYear}`,
        'Statistical analysis of personnel appointments, promotions, and separations'
    );

    // --- Data Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Movement Category', 'Personnel Count', 'Classification']],
        body: data.map(d => [
            d.category,
            d.count.toString(),
            d.type
        ]),
        theme: 'striped',
        headStyles: { fillColor: QNHS_BLUE },
        styles: { fontSize: 9, cellPadding: 5 }
    });

    // Analytics Summary
    const inflows = data.filter(d => d.type === 'Inflow').reduce((sum, d) => sum + d.count, 0);
    const outflows = data.filter(d => d.type === 'Outflow').reduce((sum, d) => sum + d.count, 0);
    const netChange = inflows - outflows;

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NET MOVEMENT ANALYSIS', 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Staff Inflow (New Hires): ${inflows}`, 20, finalY + 7);
    doc.text(`Total Staff Outflow (Separations): ${outflows}`, 20, finalY + 13);
    doc.text(`Net Workforce Change: ${netChange > 0 ? '+' : ''}${netChange}`, 20, finalY + 19);

    addPageFooter(doc, generatedAt);
    handleOutput(doc, `QNHS_Workforce_Movement_${currentYear}.pdf`, action);
};
