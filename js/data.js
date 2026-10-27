// Mídias locais reutilizadas em todas as seções; sem chamadas a APIs externas.
export const artworks = [
  {id:'base',title:'Luffy',category:'base',image:'Luffy.webp',description:'O capitão dos Chapéus de Palha inicia a aventura movido pela liberdade e pelo sonho de ser Rei dos Piratas.'},
  {id:'gear2',title:'Gear Second',category:'gear',image:'g2_0.webp',description:'Uma transformação que acelera seus movimentos e eleva sua velocidade.'},
  {id:'gear2b',title:'Gear Second em ação',category:'gear',image:'g2_1.webp',description:'Velocidade e golpes intensificados na jornada do capitão.'},
  {id:'gear3',title:'Gear Third',category:'gear',image:'g3_0.webp',description:'Uma técnica que amplia partes do corpo para ataques de grande impacto.'},
  {id:'gear3b',title:'Gear Third em ação',category:'gear',image:'g3_1.webp',description:'Golpes gigantescos para enfrentar novos desafios.'},
  {id:'gear4',title:'Gear Fourth',category:'gear',image:'g4_1.webp',description:'Uma combinação de elasticidade e Haki com potência e mobilidade únicas.'},
  {id:'tankman',title:'Tankman',category:'gear',image:'Tankman.webp',description:'Variação defensiva do Gear Fourth.'},
  {id:'snakeman',title:'Snakeman',category:'gear',image:'Snakeman.webp',description:'Variação ágil do Gear Fourth com ataques de trajetória imprevisível.'},
  {id:'gear5',title:'Gear Fifth',category:'gear',image:'g5_1.webp',description:'Uma transformação marcada por movimentos livres e imaginativos.'},
  {id:'nightmare',title:'Nightmare Luffy',category:'special',image:'Nightmare.webp',description:'Uma forma temporária vista durante a aventura de Thriller Bark.'}
];
export const imagePath = (artwork) => './media/img/' + artwork.image;
