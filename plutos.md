React é uma biblioteca JavaScript para construir interfaces de utilizador baseadas em componentes. O seu principal objetivo é tornar as atualizações da interface eficientes através de um Virtual DOM e de um algoritmo de reconciliação que minimiza as alterações feitas ao DOM real.

React State - O State representa os dados que podem mudar durante a vida do componente.

Render - Executar novamente a função do componente para gerar uma nova representação da interface.

Reconciliation - Comprar o Virtual Dom antigo com o Virtual Dom novo

Diffing Algorithm basicamente sabe o que mudou entre o que a pagina tinha antes da atualizacao com o que eu decidi mudar

POrque e que React e rapido? Ser rapido vem do facto de o React comparar duas árvores em memória através do algoritmo de reconciliação e aplicar apenas as diferenças necessárias ao DOM real, reduzindo operações dispendiosas sobre o browser.

Quando um componente renderiza?

Quando o State muda.
Quando as Props mudam.
Quando o componente pai renderiza (salvo otimizações como React.memo)


O que sao Hooks ?
Hooks são funções especiais que permitem utilizar funcionalidades do React, como estado, efeitos secundários e contexto, dentro de componentes funcionais, sem recorrer a classes.

UseState -Permite adicionar e gerir estado local dentro de um componente funcional. Sempre que o estado é atualizado através da função setter, o React agenda um novo render do componente.

useEffect - Permite executar efeitos secundários (side effects) num componente, como pedidos HTTP, timers, event listeners ou acesso ao localStorage. A sua execução pode ser controlada através do array de dependências.

useRef - Permite guardar uma referência persistente entre renders sem provocar um novo render quando o seu valor é alterado. É frequentemente utilizado para aceder diretamente a elementos do DOM ou armazenar valores mutáveis.

useMemo - Memoriza o resultado de um cálculo para evitar que seja recalculado em todos os renders. O valor só é recalculado quando as dependências mudam.

useContext - Permite aceder a dados partilhados através de um Context sem necessidade de passar props manualmente por vários níveis da árvore de componentes (prop drilling).

React.memo - Higher Order Component (HOC) que memoriza um componente e evita re-renders desnecessários quando as suas props não se alteram.

Quando usarias useMemo e useCallback?
useMemo: "Utilizo useMemo quando tenho um cálculo relativamente pesado que não precisa de ser executado em todos os renders, como ordenação, filtragem ou agregação de dados."
useCallback: "Utilizo useCallback quando passo uma função como prop para componentes filhos, especialmente se esses componentes estiverem otimizados com React.memo, para evitar re-renders desnecessários causados pela criação de uma nova referência da função."


Next vs React

React é uma biblioteca para construir interfaces. Next.js é uma framework construída sobre React que adiciona funcionalidades como routing baseado em ficheiros, Server-Side Rendering, Static Site Generation, API Routes e otimizações automáticas de performance e SEO.

O que é Hydration?
É o processo em que o React associa a lógica JavaScript ao HTML previamente renderizado no servidor, tornando a página interativa.

Estrutura tipica de react

Normalmente separo a aplicação por responsabilidades. Os componentes ficam responsáveis apenas pela interface, os services encapsulam toda a comunicação com o backend, os hooks reutilizam lógica entre componentes, os types centralizam as definições TypeScript e os utils contêm funções auxiliares independentes do React. Desta forma consigo reduzir acoplamento, aumentar reutilização e tornar a manutenção da aplicação mais simples.

src/

│

├── components/ - Aqui ficam componentes reutilizáveis.

├── pages/ - Representam páginas.

├── hooks/ - Aqui ficam Hooks personalizados.

├── services/ - Toda a comunicação com backend.

├── api/ - Aqui normalmente colocamos:

├── utils/  - Funções utilitárias

├── types/ - Objetos tipo

├── styles/ - css , tailwind, fonts

└── constants/ - Tudo o que nunca muda.