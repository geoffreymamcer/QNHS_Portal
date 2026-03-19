import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const QNHS_BLUE: [number, number, number] = [30, 58, 138];

interface IERData {
    hiringDate: string;
    position: string;
    salaryGrade: string;
    monthlySalary: string;
    qs: {
        education: string;
        training: string;
        experience: string;
        eligibility: string;
    };
    applicants: any[];
}

export const generateIERPDF = (data: IERData, action: 'download' | 'view' = 'download') => {
    // Landscape A4 (297 x 210 mm)
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    // Max 7 applicants per page
    const itemsPerPage = 7;
    const totalItems = data.applicants.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        if (pageIdx > 0) doc.addPage();

        const startIdx = pageIdx * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, totalItems);
        const pageApplicants = data.applicants.slice(startIdx, endIdx);

        // --- 1. Header Section ---
        addIERHeader(doc, pageWidth);

        // --- 2. Title Section ---
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('INITIAL EVALUATION RESULT (IER)', pageWidth / 2, 58, { align: 'center' });

        // --- 3. Context Info Section ---
        let currentY = 68;
        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        doc.text(`Position: ${data.position}`, margin, currentY);
        currentY += 5;
        doc.text(`Salary Grade and Monthly Salary: SG- ${data.salaryGrade} / ${data.monthlySalary}`, margin, currentY);
        currentY += 5;
        doc.text('Qualification Standards:', margin, currentY);

        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        currentY += 5;
        const qsLabelWidth = 25;
        const qsValueWidth = contentWidth - qsLabelWidth;

        doc.text('Education:', margin + 5, currentY);
        doc.text(doc.splitTextToSize(data.qs.education, qsValueWidth), margin + 5 + qsLabelWidth, currentY);
        currentY += 5;

        doc.text('Training:', margin + 5, currentY);
        doc.text(doc.splitTextToSize(data.qs.training, qsValueWidth), margin + 5 + qsLabelWidth, currentY);
        currentY += 5;

        doc.text('Experience:', margin + 5, currentY);
        doc.text(doc.splitTextToSize(data.qs.experience, qsValueWidth), margin + 5 + qsLabelWidth, currentY);
        currentY += 5;

        doc.text('Eligibility:', margin + 5, currentY);
        doc.text(doc.splitTextToSize(data.qs.eligibility, qsValueWidth), margin + 5 + qsLabelWidth, currentY);
        currentY += 10;

        // --- 4. Table Section ---
        const tableBody = pageApplicants.map((applicant, localIdx) => {
            const latestEdu = applicant.education?.length > 0 ? applicant.education[0] : null;
            const eduText = latestEdu ? `${latestEdu.degree} (${latestEdu.school}, ${latestEdu.yearGraduated || latestEdu.year || 'N/A'})` : 'N/A';

            const totalHours = applicant.trainings?.reduce((sum: number, t: any) => sum + (parseInt(t.hours) || 0), 0) || 0;
            const lastTraining = applicant.trainings?.length > 0 ? applicant.trainings[applicant.trainings.length - 1].title : 'N/A';

            const lastExp = applicant.experiences?.length > 0 ? (applicant.experiences[applicant.experiences.length - 1].details || applicant.experiences[applicant.experiences.length - 1].position || 'N/A') : 'N/A';
            const totalYears = applicant.experiences?.length > 0 ? calculateTotalYears(applicant.experiences) : '0';

            return [
                (startIdx + localIdx + 1).toString(), // Number
                applicant.applicant_code,
                `${applicant.firstname} ${applicant.middlename ? applicant.middlename[0] + '. ' : ''}${applicant.surname} ${applicant.extension || ''}`,
                applicant.address,
                applicant.age?.toString() || '',
                applicant.sex || '',
                applicant.civil_status || '',
                applicant.religion || '',
                applicant.disability || 'None',
                applicant.ethnic_group || 'None',
                applicant.email || '',
                applicant.contact_no || '',
                eduText,
                lastTraining,
                totalHours.toString(),
                lastExp,
                totalYears,
                applicant.eligibility || 'N/A',
                applicant.status || 'Pending',
                applicant.performance || 'N/A'
            ];
        });

        autoTable(doc, {
            startY: currentY,
            margin: { left: margin, right: margin },
            head: [
                // Level 1 Headers (Merged Groups)
                [
                    { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'Application Code', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'Names of Applicant', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'PERSONAL INFORMATION', colSpan: 9, styles: { halign: 'center' } },
                    { content: 'Education', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'Training', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Experience', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Eligibility', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'Remarks', colSpan: 2, styles: { halign: 'center' } }
                ],
                // Level 2 Headers
                [
                    'Address', 'Age', 'Sex', 'Status', 'Religion', 'Disability', 'Ethnic', 'Email', 'Contact',
                    'Title', 'Hours',
                    'Details', 'Years',
                    'QS', 'Perf'
                ]
            ],
            body: tableBody,
            theme: 'grid',
            styles: {
                fontSize: 7,
                cellPadding: 1,
                font: 'times',
                textColor: [0, 0, 0],
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 7 }, // No
                1: { cellWidth: 14 }, // Code
                2: { cellWidth: 24 }, // Name
                3: { cellWidth: 28 }, // Address
                4: { cellWidth: 7 }, // Age
                5: { cellWidth: 9 }, // Sex
                6: { cellWidth: 9 }, // Status
                7: { cellWidth: 14 }, // Religion
                8: { cellWidth: 11 }, // Disability
                9: { cellWidth: 11 }, // Ethnic
                10: { cellWidth: 18 }, // Email
                11: { cellWidth: 14 }, // Contact
                12: { cellWidth: 24 }, // Education
                13: { cellWidth: 19 }, // Training Title
                14: { cellWidth: 7 }, // Training Hours
                15: { cellWidth: 19 }, // Experience Details
                16: { cellWidth: 9 }, // Experience Years
                17: { cellWidth: 14 }, // Eligibility
                18: { cellWidth: 11 }, // QS
                19: { cellWidth: 10 }, // Perf
            }
        });

        // --- 5. Footer Section ---
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        const footerX = pageWidth - 60;

        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        doc.text('Prepared and certified correct by:', footerX, finalY);

        doc.setFont('times', 'bold');
        doc.text('JELANIE Q. ORIÑA', footerX, finalY + 15);
        doc.setFont('times', 'normal');
        doc.text('Administrative Officer IV', footerX, finalY + 20);

        // Bold line above name
        doc.setLineWidth(0.5);
        doc.line(footerX, finalY + 12, footerX + 50, finalY + 12);
    }

    const filename = `IER_Report_${data.position}_${data.hiringDate}.pdf`;
    if (action === 'view') {
        const url = doc.output('bloburl');
        window.open(url, '_blank');
    } else {
        doc.save(filename);
    }
};

const addIERHeader = (doc: jsPDF, pageWidth: number) => {
    // 1. Centered Logo
    try {
        const logoSize = 18;
        doc.addImage('/deped_logo.png', 'PNG', (pageWidth - logoSize) / 2, 5, logoSize, logoSize);
    } catch (e) {
        console.error('Logo failed to load', e);
    }

    // 2. Headings
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    const headerLines = [
        'Republic of the Philippines',
        'Department of Education',
        'REGION IV-A CALABARZON',
        'SCHOOLS DIVISION OF QUEZON',
        'QUEZON NATIONAL HIGH SCHOOL',
        'IBABANG IYAM, LUCENA CITY'
    ];

    let headerY = 26; // Below the logo
    headerLines.forEach((line, i) => {
        doc.setFont('times', i === 4 ? 'bold' : 'normal'); // QNHS in bold
        doc.text(line, pageWidth / 2, headerY, { align: 'center' });
        headerY += i === headerLines.length - 1 ? 0 : 4;
    });

    // 3. Divider
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(10, headerY + 2, pageWidth - 10, headerY + 2);
};

const calculateTotalYears = (experiences: any[]) => {
    let totalMonths = 0;
    experiences.forEach(exp => {
        if (exp.from && exp.to) {
            const from = new Date(exp.from);
            const to = exp.to ? new Date(exp.to) : new Date();
            const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
            totalMonths += months;
        } else if (exp.years) {
            totalMonths += (parseInt(exp.years) || 0) * 12;
        }
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years > 0 && months > 0) return `${years} yrs & ${months} mos`;
    if (years > 0) return `${years} yrs`;
    return `${months} mos`;
};
