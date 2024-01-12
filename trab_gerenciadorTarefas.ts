class Projeto {
    private objetivos: string;
    private prazo: Date;
    private atribuicoes: Usuario[];
    private tarefas: Tarefa[];

    constructor(objetivos: string, prazo: Date, responsaveis: Usuario[]) {
        this.objetivos = objetivos;
        this.prazo = prazo;
        this.atribuicoes = responsaveis;
        this.tarefas = [];
    }

    adicionarTarefa(tarefa: Tarefa): void {
        this.tarefas.push(tarefa);
    }

    atribuirTarefaAUsuario(tarefa: Tarefa, usuario: Usuario): void {
        if (this.atribuicoes.includes(usuario)) {
            this.atribuirTarefaRecursivo(tarefa, usuario);
        } else {
            console.log(O usuário "${usuario.nome}" não está associado ao projeto.);
        }
    }

    private atribuirTarefaRecursivo(tarefa: Tarefa, usuario: Usuario): void {
        if (tarefa instanceof TarefaComplexa) {
            for (const subTarefa of tarefa.getSubTarefas()) {
                this.atribuirTarefaRecursivo(subTarefa, usuario);
            }
        }

        const indiceTarefa = this.tarefas.indexOf(tarefa);
        if (indiceTarefa !== -1) {
            usuario.tarefas_atribuidas.push(tarefa);
            console.log(Tarefa "${tarefa.getDescricao()}" atribuída ao usuário "${usuario.nome}".);
        } else {
            console.log(A tarefa "${tarefa.getDescricao()}" não está associada ao projeto.);
        }
    }

    concluirTarefa(tarefa: Tarefa, dataConclusao: Date): void {
        if (this.tarefas.includes(tarefa)) {
            tarefa.concluir(dataConclusao);
            console.log(Tarefa "${tarefa.getDescricao()}" concluída em ${dataConclusao.toISOString()}.);

            if (tarefa.verificarPrazo()) {
                console.log(Atenção: A tarefa "${tarefa.getDescricao()}" foi concluída após o prazo estabelecido.);
            }
        } else {
            console.log(A tarefa "${tarefa.getDescricao()}" não está associada ao projeto.);
        }
    }

    removerTarefa(tarefa: Tarefa): void {
        if (this.tarefas.includes(tarefa)) {
            this.tarefas.splice(this.tarefas.indexOf(tarefa), 1);
            console.log(Tarefa removida do projeto.);

            for (const user of this.atribuicoes) {
                const indiceTarefa = user.tarefas_atribuidas.indexOf(tarefa);
                if (indiceTarefa !== -1) {
                    user.tarefas_atribuidas.splice(indiceTarefa, 1);
                    console.log(Tarefa removida do usuário "${user.nome}".);
                    break;
                }
            }
        } else {
            console.log(A tarefa não está associada ao projeto.);
        }
    }

    gerarRelatorioProgresso(): string {
        let relatorio = Relatório de Progresso do Projeto "${this.objetivos}":\n;
        for (const tarefa of this.tarefas) {
            relatorio += this.gerarRelatorioTarefa(tarefa, 0);
        }
        return relatorio;
    }

    private gerarRelatorioTarefa(tarefa: Tarefa, nivelIndentacao: number): string {
        let relatorio = '';
        const indentacao = ' '.repeat(nivelIndentacao * 2);

        relatorio += ${indentacao}- Descrição: ${tarefa.getDescricao()}, Status: ${tarefa.getStatus()}, Progresso: ${tarefa.acompanharProgresso()}%\n;

        if (tarefa instanceof TarefaComplexa) {
            const subTarefas = tarefa.getSubTarefas();
            for (const subTarefa of subTarefas) {
                relatorio += this.gerarRelatorioTarefa(subTarefa, nivelIndentacao + 1);
            }
        }

        return relatorio;
    }
}

class Usuario {
    nome: string;
    tarefas_atribuidas: Tarefa[];
    projetos_participantes: Projeto[];

    constructor(nome: string) {
        this.nome = nome;
        this.tarefas_atribuidas = [];
        this.projetos_participantes = [];
    }
}

abstract class Tarefa {
    protected descricao: string;
    protected prazo: Date;
    protected status: string;
    protected dataConclusao: Date | null;

    constructor(descricao: string, prazo: Date, status: string) {
        this.descricao = descricao;
        this.prazo = prazo;
        this.status = status;
        this.dataConclusao = null;
    }

    abstract acompanharProgresso(): number;

    concluir(dataConclusao: Date): void {
        this.status = "Concluída";
        this.dataConclusao = dataConclusao;
    }

    verificarPrazo(): boolean {
        return this.dataConclusao !== null && this.dataConclusao > this.prazo;
    }

    getDescricao(): string {
        return this.descricao;
    }

    getStatus(): string {
        return this.status;
    }
}

class TarefaSimples extends Tarefa {
    private responsavel: Usuario;

    constructor(responsavel: Usuario, descricao: string, prazo: Date, status: string = "Em andamento") {
        super(descricao, prazo, status);
        this.responsavel = responsavel;
    }

    acompanharProgresso(): number {
        return this.status === "Concluída" ? 100 : 0;
    }
}

class TarefaComplexa extends Tarefa {
    private subTarefas: Tarefa[];
    private responsaveis: Usuario[];

    constructor(subTarefas: Tarefa[], responsaveis: Usuario[], descricao: string, prazo: Date, status: string = "Em andamento") {
        super(descricao, prazo, status);
        this.subTarefas = subTarefas;
        this.responsaveis = responsaveis;
    }

    verificarPrazo(): boolean {
        if (super.verificarPrazo()) {
            return true;
        }

        for (const subTarefa of this.subTarefas) {
            if (subTarefa.verificarPrazo()) {
                return true;
            }
        }

        return false;
    }

    getSubTarefas(): Tarefa[] {
        return this.subTarefas;
    }

    acompanharProgresso(): number {
        if (this.getStatus() === "Concluída") {
            return 100;
        } else {
            const progressoSubTarefas = this.subTarefas.reduce((total, subTarefa) => total + subTarefa.acompanharProgresso(), 0);
            return progressoSubTarefas / this.subTarefas.length;
        }
    }
}

const usuario1 = new Usuario("Alice");
const usuario2 = new Usuario("Bob");
const usuario3 = new Usuario("Charlie");

const tarefaSimples1 = new TarefaSimples(usuario1, "Revisar código", new Date("2024-01-15"), "Em andamento");
const tarefaSimples2 = new TarefaSimples(usuario2, "Modularizar código", new Date("2024-01-20"), "Em andamento");
const tarefaSimples3 = new TarefaSimples(usuario2, "Criar nova classe", new Date("2024-01-20"), "Em andamento");
const tarefaSimples5 = new TarefaSimples(usuario3, "Revisar documentação", new Date("2024-01-18"), "Em andamento");

const tarefaComplexa1 = new TarefaComplexa([tarefaSimples1, tarefaSimples2], [usuario1, usuario2], "Tarefa Complexa 1", new Date("2024-01-25"), "Em andamento");

const projeto = new Projeto("Implementação de software", new Date("2024-02-01"), [usuario1, usuario2, usuario3]);

projeto.adicionarTarefa(tarefaSimples1);
projeto.adicionarTarefa(tarefaSimples2);
projeto.adicionarTarefa(tarefaSimples3);
projeto.adicionarTarefa(tarefaSimples5);
projeto.adicionarTarefa(tarefaComplexa1);

projeto.atribuirTarefaAUsuario(tarefaSimples1, usuario1);
projeto.atribuirTarefaAUsuario(tarefaSimples2, usuario2);
projeto.atribuirTarefaAUsuario(tarefaComplexa1, usuario1);
projeto.atribuirTarefaAUsuario(tarefaSimples5, usuario3);

projeto.removerTarefa(tarefaSimples5);

const dataConclusaoTarefaSimples1 = new Date("2024-01-14");
projeto.concluirTarefa(tarefaSimples1, dataConclusaoTarefaSimples1);

const dataConclusaoTarefaComplexa1 = new Date("2024-01-26");
projeto.concluirTarefa(tarefaComplexa1, dataConclusaoTarefaComplexa1);

const tarefaSimples4 = new TarefaSimples(usuario1, "Testar novo método", new Date("2024-01-10"), "Em andamento");
projeto.adicionarTarefa(tarefaSimples4);
projeto.atribuirTarefaAUsuario(tarefaSimples4, usuario1);
const dataConclusaoTarefaAtrasada = new Date("2024-01-12");
projeto.concluirTarefa(tarefaSimples4, dataConclusaoTarefaAtrasada);

const relatorioProgresso = projeto.gerarRelatorioProgresso();
console.log(relatorioProgresso);