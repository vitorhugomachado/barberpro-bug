const fs = require('fs');

let content = fs.readFileSync('src/pages/Finance.jsx', 'utf-8');

// 1. Add new icons
content = content.replace(
  'Trophy, Store, LayoutList, CreditCard',
  'Trophy, Store, LayoutList, CreditCard, Plus, Edit2, Trash2, X, Wallet'
);

// 2. Add contexts for expenses
content = content.replace(
  'const { barbers, appointments, productSales, getFinancialStats, getBarberRanking, currentUser } = useApp();',
  'const { barbers, appointments, productSales, getFinancialStats, getBarberRanking, currentUser, expenses, addExpense, removeExpense, updateExpense } = useApp();'
);

// 3. Add states for expenses modal
content = content.replace(
  'const [endDate, setEndDate] = useState(getLocalDateStr(lastDay));',
  `const [endDate, setEndDate] = useState(getLocalDateStr(lastDay));
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: getLocalDateStr(new Date()), category: 'Operacional' });

  const handleOpenExpenseModal = (expense = null) => {
    if (expense) {
      setEditingExpenseId(expense.id);
      setExpenseForm({ description: expense.description, amount: expense.amount, date: expense.date, category: expense.category || 'Operacional' });
    } else {
      setEditingExpenseId(null);
      setExpenseForm({ description: '', amount: '', date: startDate, category: 'Operacional' });
    }
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) return;
    if (editingExpenseId) {
      updateExpense(editingExpenseId, expenseForm);
    } else {
      addExpense(expenseForm);
    }
    setIsExpenseModalOpen(false);
  };
`
);

// 4. Remove ranking and insert Receitas x Despesas
content = content.replace(
  /\{\/\* Ranking de barbeiros — apenas na visão geral \*\/\}.*?(?=\{\/\* Receita de Produtos da Barbearia \(sem barbeiro\) \*\/\})/s,
  `{/* Receitas x Despesas - Apenas Visão Geral */}
        {selectedView === 'geral' && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wallet size={20} />
                <h3 style={{ fontSize: '1.1rem' }}>Receitas x Despesas</h3>
              </div>
              <button className="btn-primary" onClick={() => handleOpenExpenseModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Nova Despesa
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, background: 'var(--brand-50)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--brand-200)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-800)', fontWeight: 600, marginBottom: '4px' }}>RECEITAS TOTAIS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-600)' }}>{formatCurrency(stats.revenue)}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(239,68,68,0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>DESPESAS TOTAIS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(stats.expenses)}</div>
              </div>
            </div>

            {/* Lista de Despesas */}
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Despesas do Período</h4>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }} className="hide-scrollbar">
              {stats.expensesList && stats.expensesList.length === 0 ? (
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Nenhuma despesa registrada no período.</p>
              ) : (
                stats.expensesList?.map(exp => (
                  <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exp.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exp.category} · {exp.date?.split('-').reverse().join('/')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontWeight: 700, color: '#ef4444' }}>- {formatCurrency(exp.amount)}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleOpenExpenseModal(exp)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => { if(window.confirm('Excluir despesa?')) removeExpense(exp.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            `
);

// 5. Add expense modal
content = content.replace(
  'return (',
  `return (
    <>
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '400px', background: 'var(--surface-color)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsExpenseModalOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Descrição (Ex: Conta de Luz)" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }}>R$</span>
                <input type="number" placeholder="0.00" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                  <option value="Operacional">Operacional</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Salários">Salários</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <button className="btn-primary" style={{ marginTop: '1rem', padding: '14px' }} onClick={handleSaveExpense} disabled={!expenseForm.description || !expenseForm.amount}>
                {editingExpenseId ? 'Salvar Alterações' : 'Registrar Despesa'}
              </button>
            </div>
          </div>
        </div>
      )}
`
);

// We need to match the return block we just replaced, this is a bit hacky so let's do a more robust replacement for the modal.
// Wait, my regex replacements above might be prone to error if executed multiple times. But this is a fresh script. Let's fix the return tag replacement:
content = content.replace(
  '  return (\n    <div className="fade-in">',
  `  return (\n    <>\n      {isExpenseModalOpen && (\n        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>\n          <div className="glass-card fade-in" style={{ width: '400px', background: 'var(--surface-color)', padding: '2rem' }}>\n            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>\n              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}</h2>\n              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsExpenseModalOpen(false)}><X size={20} /></button>\n            </div>\n            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>\n              <input type="text" placeholder="Descrição (Ex: Conta de Luz)" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />\n              <div style={{ position: 'relative' }}>\n                <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }}>R$</span>\n                <input type="number" placeholder="0.00" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />\n              </div>\n              <div style={{ display: 'flex', gap: '10px' }}>\n                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />\n                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>\n                  <option value="Operacional">Operacional</option>\n                  <option value="Insumos">Insumos</option>\n                  <option value="Marketing">Marketing</option>\n                  <option value="Salários">Salários</option>\n                  <option value="Outros">Outros</option>\n                </select>\n              </div>\n              <button className="btn-primary" style={{ marginTop: '1rem', padding: '14px' }} onClick={handleSaveExpense} disabled={!expenseForm.description || !expenseForm.amount}>\n                {editingExpenseId ? 'Salvar Alterações' : 'Registrar Despesa'}\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n    <div className="fade-in">`
);

// Close the React.Fragment at the very end
content = content.replace(
  '    </div>\n  );\n};\n\nexport default Finance;',
  '    </div>\n    </>\n  );\n};\n\nexport default Finance;'
);

fs.writeFileSync('src/pages/Finance.jsx', content, 'utf-8');
console.log('Finance.jsx refactored successfully.');
