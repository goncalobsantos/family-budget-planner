export const translations = {
  pt: {
    // Common
    "common.familyBudget": "Orçamento Familiar",
    "common.loading": "A carregar…",
    "common.total": "Total",
    "common.income": "Receitas",
    "common.expenses": "Despesas",
    "common.savings": "Poupança",
    "common.needs": "Necessidades",
    "common.wants": "Desejos",
    "common.saves": "Poupança",
    "common.net": "Resultado Líquido",
    "common.date": "Data",
    "common.note": "Nota",
    "common.category": "Categoria",
    "common.amount": "Valor",
    "common.planned": "planeado",
    "common.target": "objetivo",
    "common.transactions": "transações",
    "common.transaction": "transação",
    "common.noData": "—",

    // Metadata
    "meta.description": "Apresentação e planeamento do orçamento familiar mensal",

    // Login
    "login.enterPassword": "Introduza a palavra-passe para continuar",
    "login.password": "Palavra-passe",
    "login.enter": "Entrar",
    "login.loginFailed": "Falha no login",
    "login.serverError": "Erro do servidor ({status})",
    "login.networkError": "Erro de rede",

    // Upload / Home page
    "upload.subtitle": "Carrega o CSV mensal ou consulta análises anteriores",
    "upload.dropHere": "Arrasta o ficheiro CSV para aqui",
    "upload.orClickBrowse": "ou clica para procurar",
    "upload.recordsLoaded": "{count} registos carregados · {start} — {end}",
    "upload.clickDifferentFile": "Clica para carregar outro ficheiro",
    "upload.startPresentation": "Iniciar Apresentação",

    // Presentation page
    "presentation.saveToArchive": "Guardar no Arquivo",    "presentation.save": "Guardar",    "presentation.saving": "A guardar…",
    "presentation.archived": "Arquivado",

    // Slide labels
    "slideLabel.balances": "Saldos",
    "slideLabel.moneyFlow": "Fluxo Monetário",
    "slideLabel.categories": "Categorias",
    "slideLabel.extraInfo": "Info Extra",
    "slideLabel.yearOverview": "Visão Anual",
    "slideLabel.budgetVsActual": "Orçamento vs Real",
    "slideLabel.nextMonth": "Próximo Mês",
    "slideLabel.planner": "Planeamento",
    "slideLabel.debtsAndGoals": "Dívidas & Objetivos",

    // Presentation menu
    "presentation.menu": "Menu",
    "presentation.options": "Opções",
    "presentation.language": "Idioma",

    // Slide navigation
    "slide.previousSlide": "Slide anterior",
    "slide.nextSlide": "Próximo slide",
    "slide.slideN": "Slide {n}",
    "slide.prev": "Ant.",
    "slide.next": "Seg.",
    "slide.slideMenu": "Menu de slides",
    "slide.goToSlide": "Ir para slide",
    "slide.current": "Atual",

    // Archives
    "archives.title": "Arquivo",
    "archives.monthlyAnalyses": "Análises Mensais",
    "archives.budgetPlans": "Planos de Orçamento",
    "archives.loadingArchives": "A carregar arquivo…",
    "archives.budgetPlan": "Plano de Orçamento",
    "archives.failedToLoad": "Falha ao carregar ficheiro",

    // Opening Balances slide
    "openingBalances.title": "Saldos Iniciais",
    "openingBalances.subtitle": "Como começámos a {date}",
    "openingBalances.totalAcrossAccounts": "Total de todas as contas",
    "openingBalances.mainAccount": "Conta Principal",
    "openingBalances.coverflex": "Coverflex",
    "openingBalances.savings": "Poupança",

    // Money Flow slide
    "moneyFlow.title": "Fluxo Monetário",
    "moneyFlow.subtitle": "Como é que os nossos saldos evoluíram em todas as contas",
    "moneyFlow.mainAccount": "Conta Principal",
    "moneyFlow.coverflex": "Coverflex",
    "moneyFlow.savings": "Poupança",

    // Category Breakdown slide
    "categoryBreakdown.title": "Gastos por Categoria",
    "categoryBreakdown.subtitle": "Para onde foi o nosso dinheiro · Total: €{total}",

    // Extra Info Breakdown slide
    "extraInfo.title": "Categorias Pessoais",
    "extraInfo.subtitle": "Um olhar mais profundo sobre os nossos gastos · Total: €{total}",

    // Category Detail Modal
    "categoryModal.transactionsTotal": "{count} {transactionWord} · Total: ",

    // Project Monthly slide
    "projectMonthly.monthlyOverview": "Visão mensal",
    "projectMonthly.netResult": "Resultado Líquido",
    "projectMonthly.incomeDetails": "Detalhes de Receitas",
    "projectMonthly.expenseDetails": "Detalhes de Despesas",
    "projectMonthly.noIncome": "Sem receitas este mês",
    "projectMonthly.noExpenses": "Sem despesas este mês",

    // Projects Year Overview slide
    "projectsYear.title": "Projetos — Visão Anual {year}",
    "projectsYear.subtitle": "Dados do ano completo do histórico CSV",
    "projectsYear.labstoriesIncome": "LabStories Receitas",
    "projectsYear.labstoriesExpenses": "LabStories Despesas",
    "projectsYear.dwellinIncome": "Dwellin' Receitas",
    "projectsYear.dwellinExpenses": "Dwellin' Despesas",
    "projectsYear.ytd": "YTD",

    // Next Month Preview slide
    "nextMonth.title": "Previsão Próximo Mês",
    "nextMonth.subtitle": "Receitas esperadas e pagamentos agendados",
    "nextMonth.expectedIncome": "Receitas Esperadas",
    "nextMonth.accountLeftovers": "Saldos Residuais",
    "nextMonth.totalIncome": "Total de Receitas",
    "nextMonth.savingsPercent": "Poupança ({pct}%)",
    "nextMonth.scheduledPayments": "Pagamentos Agendados",
    "nextMonth.totalScheduled": "Total Agendado",
    "nextMonth.disposableIncome": "Rendimento Disponível (após agendados + {pct}% poupança)",

    // Budget Planner slide
    "planner.title": "Planeamento de Orçamento",
    "planner.subtitle": "Planeia cada euro — Receitas: €{income}",
    "planner.overBudget": "Acima do orçamento em €{amount}",
    "planner.allAssigned": "Cada euro tem um propósito!",
    "planner.unassigned": "€{amount} por atribuir",
    "planner.allocateToGoals": "Alocar a objetivos",
    "planner.unallocated": "€{amount} não alocado",
    "planner.addCategory": "Adicionar categoria",
    "planner.selectCategory": "Selecionar categoria...",
    "planner.subcategory": "subcategoria",
    "planner.subcategoryPlaceholder": "Subcategoria...",
    "planner.saveBudgetPlan": "Guardar Plano de Orçamento",
    "planner.savingPlan": "A guardar…",
    "planner.planSaved": "Plano Guardado e Exportado!",
    "planner.fixOverBudget": "Corrigir excesso antes de guardar",

    // Debts & Goals slide
    "debtsGoals.title": "Dívidas & Objetivos",
    "debtsGoals.subtitle": "A acompanhar a nossa jornada financeira",
    "debtsGoals.debts": "Dívidas",
    "debtsGoals.financialGoals": "Objetivos Financeiros",
    "debtsGoals.paidTotal": "€{paid} pago / €{total} total",
    "debtsGoals.remaining": "Restante: €{amount}",
    "debtsGoals.thisMonth": "-€{amount} este mês",
    "debtsGoals.deadline": "Prazo",
    "debtsGoals.monthlyNeeded": "Necessário por mês",

    // Budget Analysis slide
    "budgetAnalysis.title": "Revisão do Orçamento — {month}",
    "budgetAnalysis.subtitle": "Como nos saímos vs. o plano?",
    "budgetAnalysis.partialMonth": "Mês parcial: {days} de {totalDays} dias ({pct}% cobertura)",
    "budgetAnalysis.underBudget": "abaixo do orçamento",
    "budgetAnalysis.overBudget": "acima do orçamento",
    "budgetAnalysis.budgetVsActual": "Orçamento vs Real por Categoria",
    "budgetAnalysis.needsBreakdown": "Detalhe Necessidades",
    "budgetAnalysis.wantsBreakdown": "Detalhe Desejos",
    "budgetAnalysis.wins": "Vitórias",
    "budgetAnalysis.overages": "Excessos",
    "budgetAnalysis.noCategoryComparisons": "Sem comparações de categorias detalhadas disponíveis. O plano de orçamento pode não ter categorias detalhadas.",

    // Budget Plan Viewer
    "budgetViewer.title": "Plano de Orçamento — {month}",
    "budgetViewer.created": "Criado a {date}",
    "budgetViewer.overview": "Visão Geral",
    "budgetViewer.totalIncome": "Total de Receitas",
    "budgetViewer.scheduled": "Agendado",
    "budgetViewer.disposable": "Disponível",
    "budgetViewer.scheduledNeeds": "Necessidades Agendadas",
    "budgetViewer.scheduledWants": "Desejos Agendados",
    "budgetViewer.accountCarryover": "Transição de Contas",
    "budgetViewer.main": "Principal",
    "budgetViewer.coverflex": "Coverflex",
    "budgetViewer.savingsLabel": "Poupança",
    "budgetViewer.savingsGoalAllocations": "Alocações a Objetivos de Poupança",
    "budgetViewer.unallocated": "Não alocado",
    "budgetViewer.flexibleNeeds": "Necessidades Flexíveis — €{total}",
    "budgetViewer.flexibleWants": "Desejos Flexíveis — €{total}",

    // Budget Analysis generated strings
    "analysis.categorySaved": "{category}: poupou €{amount} (usou {percent}%)",
    "analysis.categoryOverBy": "{category}: acima em €{amount} ({percent}% do orçamento)",
    "analysis.categoryUnplanned": "{category}: €{amount} gastos não planeados",
    "analysis.partialWarning": "Este CSV cobre apenas {days} de {totalDays} dias ({pct}% do mês). Os valores reais podem estar incompletos.",
    "analysis.projectedWarning": "A este ritmo, as despesas mensais projetadas seriam €{projected} vs €{budgeted} orçamentado.",
    "analysis.incomeWarning": "Receita real €{actual} foi {percent}% abaixo do esperado €{expected}.",
    "analysis.savingsWarning": "Apenas €{actual} poupado vs €{target} objetivo ({percent}%).",
  },

  en: {
    // Common
    "common.familyBudget": "Family Budget",
    "common.loading": "Loading…",
    "common.total": "Total",
    "common.income": "Income",
    "common.expenses": "Expenses",
    "common.savings": "Savings",
    "common.needs": "Needs",
    "common.wants": "Wants",
    "common.saves": "Saves",
    "common.net": "Net Result",
    "common.date": "Date",
    "common.note": "Note",
    "common.category": "Category",
    "common.amount": "Amount",
    "common.planned": "planned",
    "common.target": "target",
    "common.transactions": "transactions",
    "common.transaction": "transaction",
    "common.noData": "—",

    // Metadata
    "meta.description": "Monthly family budget presentation & planning",

    // Login
    "login.enterPassword": "Enter the password to continue",
    "login.password": "Password",
    "login.enter": "Enter",
    "login.loginFailed": "Login failed",
    "login.serverError": "Server error ({status})",
    "login.networkError": "Network error",

    // Upload / Home page
    "upload.subtitle": "Upload your monthly Wallet CSV or browse past analyses",
    "upload.dropHere": "Drop your CSV file here",
    "upload.orClickBrowse": "or click to browse",
    "upload.recordsLoaded": "{count} records loaded · {start} — {end}",
    "upload.clickDifferentFile": "Click to upload a different file",
    "upload.startPresentation": "Start Presentation",

    // Presentation page
    "presentation.saveToArchive": "Save to Archive",    "presentation.save": "Save",    "presentation.saving": "Saving…",
    "presentation.archived": "Archived",

    // Slide labels
    "slideLabel.balances": "Balances",
    "slideLabel.moneyFlow": "Money Flow",
    "slideLabel.categories": "Categories",
    "slideLabel.extraInfo": "Extra Info",
    "slideLabel.yearOverview": "Year Overview",
    "slideLabel.budgetVsActual": "Budget vs Actual",
    "slideLabel.nextMonth": "Next Month",
    "slideLabel.planner": "Planner",
    "slideLabel.debtsAndGoals": "Debts & Goals",

    // Presentation menu
    "presentation.menu": "Menu",
    "presentation.options": "Options",
    "presentation.language": "Language",

    // Slide navigation
    "slide.previousSlide": "Previous slide",
    "slide.nextSlide": "Next slide",
    "slide.slideN": "Slide {n}",
    "slide.prev": "Prev",
    "slide.next": "Next",
    "slide.slideMenu": "Slide menu",
    "slide.goToSlide": "Go to slide",
    "slide.current": "Current",

    // Archives
    "archives.title": "Archives",
    "archives.monthlyAnalyses": "Monthly Analyses",
    "archives.budgetPlans": "Budget Plans",
    "archives.loadingArchives": "Loading archives…",
    "archives.budgetPlan": "Budget Plan",
    "archives.failedToLoad": "Failed to load file",

    // Opening Balances slide
    "openingBalances.title": "Opening Balances",
    "openingBalances.subtitle": "Where we started on {date}",
    "openingBalances.totalAcrossAccounts": "Total across all accounts",
    "openingBalances.mainAccount": "Main Account",
    "openingBalances.coverflex": "Coverflex",
    "openingBalances.savings": "Savings",

    // Money Flow slide
    "moneyFlow.title": "Money Flow",
    "moneyFlow.subtitle": "How our balances moved across all accounts",
    "moneyFlow.mainAccount": "Main Account",
    "moneyFlow.coverflex": "Coverflex",
    "moneyFlow.savings": "Savings",

    // Category Breakdown slide
    "categoryBreakdown.title": "Spending by Category",
    "categoryBreakdown.subtitle": "Where our money went · Total: €{total}",

    // Extra Info Breakdown slide
    "extraInfo.title": "Personal Categories",
    "extraInfo.subtitle": "A deeper look at where we spent · Total: €{total}",

    // Category Detail Modal
    "categoryModal.transactionsTotal": "{count} {transactionWord} · Total: ",

    // Project Monthly slide
    "projectMonthly.monthlyOverview": "Monthly overview",
    "projectMonthly.netResult": "Net Result",
    "projectMonthly.incomeDetails": "Income Details",
    "projectMonthly.expenseDetails": "Expense Details",
    "projectMonthly.noIncome": "No income this month",
    "projectMonthly.noExpenses": "No expenses this month",

    // Projects Year Overview slide
    "projectsYear.title": "Projects — Year Overview {year}",
    "projectsYear.subtitle": "Full year data from CSV history",
    "projectsYear.labstoriesIncome": "LabStories Income",
    "projectsYear.labstoriesExpenses": "LabStories Expenses",
    "projectsYear.dwellinIncome": "Dwellin' Income",
    "projectsYear.dwellinExpenses": "Dwellin' Expenses",
    "projectsYear.ytd": "YTD",

    // Next Month Preview slide
    "nextMonth.title": "Next Month Preview",
    "nextMonth.subtitle": "Expected income & scheduled payments",
    "nextMonth.expectedIncome": "Expected Income",
    "nextMonth.accountLeftovers": "Account Leftovers",
    "nextMonth.totalIncome": "Total Income",
    "nextMonth.savingsPercent": "Savings ({pct}%)",
    "nextMonth.scheduledPayments": "Scheduled Payments",
    "nextMonth.totalScheduled": "Total Scheduled",
    "nextMonth.disposableIncome": "Disposable Income (after scheduled + {pct}% savings)",

    // Budget Planner slide
    "planner.title": "Budget Planning",
    "planner.subtitle": "Plan every euro — Income: €{income}",
    "planner.overBudget": "Over budget by €{amount}",
    "planner.allAssigned": "Every euro has a job!",
    "planner.unassigned": "€{amount} unassigned",
    "planner.allocateToGoals": "Allocate to goals",
    "planner.unallocated": "€{amount} unallocated",
    "planner.addCategory": "Add category",
    "planner.selectCategory": "Select a category...",
    "planner.subcategory": "subcategory",
    "planner.subcategoryPlaceholder": "Subcategory...",
    "planner.saveBudgetPlan": "Save Budget Plan",
    "planner.savingPlan": "Saving…",
    "planner.planSaved": "Plan Saved & Exported!",
    "planner.fixOverBudget": "Fix over-budget before saving",

    // Debts & Goals slide
    "debtsGoals.title": "Debts & Goals",
    "debtsGoals.subtitle": "Tracking our financial journey",
    "debtsGoals.debts": "Debts",
    "debtsGoals.financialGoals": "Financial Goals",
    "debtsGoals.paidTotal": "€{paid} paid / €{total} total",
    "debtsGoals.remaining": "Remaining: €{amount}",
    "debtsGoals.thisMonth": "-€{amount} this month",
    "debtsGoals.deadline": "Deadline",
    "debtsGoals.monthlyNeeded": "Monthly needed",

    // Budget Analysis slide
    "budgetAnalysis.title": "Budget Review — {month}",
    "budgetAnalysis.subtitle": "How did we do vs. the plan?",
    "budgetAnalysis.partialMonth": "Partial month: {days} of {totalDays} days ({pct}% coverage)",
    "budgetAnalysis.underBudget": "under budget",
    "budgetAnalysis.overBudget": "over budget",
    "budgetAnalysis.budgetVsActual": "Budget vs Actual by Category",
    "budgetAnalysis.needsBreakdown": "Needs Breakdown",
    "budgetAnalysis.wantsBreakdown": "Wants Breakdown",
    "budgetAnalysis.wins": "Wins",
    "budgetAnalysis.overages": "Overages",
    "budgetAnalysis.noCategoryComparisons": "No specific category comparisons available. The budget plan may not have detailed categories.",

    // Budget Plan Viewer
    "budgetViewer.title": "Budget Plan — {month}",
    "budgetViewer.created": "Created {date}",
    "budgetViewer.overview": "Overview",
    "budgetViewer.totalIncome": "Total Income",
    "budgetViewer.scheduled": "Scheduled",
    "budgetViewer.disposable": "Disposable",
    "budgetViewer.scheduledNeeds": "Scheduled Needs",
    "budgetViewer.scheduledWants": "Scheduled Wants",
    "budgetViewer.accountCarryover": "Account Carry-over",
    "budgetViewer.main": "Main",
    "budgetViewer.coverflex": "Coverflex",
    "budgetViewer.savingsLabel": "Savings",
    "budgetViewer.savingsGoalAllocations": "Savings Goal Allocations",
    "budgetViewer.unallocated": "Unallocated",
    "budgetViewer.flexibleNeeds": "Flexible Needs — €{total}",
    "budgetViewer.flexibleWants": "Flexible Wants — €{total}",

    // Budget Analysis generated strings
    "analysis.categorySaved": "{category}: saved €{amount} (used {percent}%)",
    "analysis.categoryOverBy": "{category}: over by €{amount} ({percent}% of budget)",
    "analysis.categoryUnplanned": "{category}: €{amount} unplanned spending",
    "analysis.partialWarning": "This CSV covers only {days} of {totalDays} days ({pct}% of the month). Actuals may be incomplete.",
    "analysis.projectedWarning": "At this pace, projected monthly expenses would be €{projected} vs €{budgeted} budgeted.",
    "analysis.incomeWarning": "Actual income €{actual} was {percent}% below expected €{expected}.",
    "analysis.savingsWarning": "Only €{actual} saved vs €{target} target ({percent}%).",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.pt;
