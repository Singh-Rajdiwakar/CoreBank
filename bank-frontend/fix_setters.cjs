const fs = require('fs');

const fix = (file, replacements) => {
    let text = fs.readFileSync(file, 'utf8');
    for (let r of replacements) {
        text = text.replace(r.from, r.to);
    }
    fs.writeFileSync(file, text, 'utf8');
}

fix('src/pages/dashboard/admin/AdminConfig.jsx', [
    { from: 'const res = await adminAPI.getSystemConfig();\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getSystemConfig();\n        setSystemConfig(res.data?.data || res.data);' },
    { from: 'const res = await adminAPI.getInterests();\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getInterests();\n        setInterests(res.data?.data || res.data);' },
    { from: 'const res = await adminAPI.getFees();\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getFees();\n        setFees(res.data?.data || res.data);' }
]);

fix('src/pages/dashboard/admin/AdminFinancialReports.jsx', [
    { from: 'const res = await adminAPI.getRevenueReport();\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getRevenueReport();\n        setRevenueData(res.data?.data || res.data);' },
    { from: 'const res = await adminAPI.getLoanPortfolioReport();\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getLoanPortfolioReport();\n        setLoanData(res.data?.data || res.data);' },
    { from: 'const res = await adminAPI.getNPASummary();\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getNPASummary();\n        setNpaData(res.data?.data || res.data);' },
    { from: 'const res = await adminAPI.getReconciliation(reconDate);\n        set(res.data?.data || res.data);', to: 'const res = await adminAPI.getReconciliation(reconDate);\n        setReconData(res.data?.data || res.data);' },
    { from: 'const res = await adminAPI.getReconciliation(reconDate);\n      set(res.data?.data || res.data);', to: 'const res = await adminAPI.getReconciliation(reconDate);\n      setReconData(res.data?.data || res.data);' }
]);

fix('src/pages/dashboard/customer/CustomerCorporate.jsx', [
    { from: 'res = await transferAPI.bulkFile(payload);\n      }\n      \n      set(res.data?.data || res.data);', to: 'res = await transferAPI.bulkFile(payload);\n      }\n      \n      setResultData(res.data?.data || res.data);' }
]);

console.log('Fixed');
