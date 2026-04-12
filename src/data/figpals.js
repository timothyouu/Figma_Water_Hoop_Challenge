// FigPal character data — mapped to SVGs in public/figpals/
// Files are named "FigPal <Name>.svg"
const figpals = [
  { id: 'ball',         name: 'Ball' },
  { id: 'bird',         name: 'Bird' },
  { id: 'boba',         name: 'Boba' },
  { id: 'boolean',      name: 'Boolean' },
  { id: 'bread',        name: 'Bread' },
  { id: 'capybara',     name: 'Capybara' },
  { id: 'cat',          name: 'Cat' },
  { id: 'caterpillar',  name: 'Caterpillar' },
  { id: 'cloud',        name: 'Cloud' },
  { id: 'coconut',      name: 'Coconut' },
  { id: 'comment',      name: 'Comment' },
  { id: 'cursor',       name: 'Cursor' },
  { id: 'dog',          name: 'Dog' },
  { id: 'duck',         name: 'Duck' },
  { id: 'dumpling',     name: 'Dumpling' },
  { id: 'dung',         name: 'Dung' },
  { id: 'egg',          name: 'Egg' },
  { id: 'elephant',     name: 'Elephant' },
  { id: 'figgy',        name: 'Figgy' },
  { id: 'fish',         name: 'Fish' },
  { id: 'flower',       name: 'Flower' },
  { id: 'frog',         name: 'Frog' },
  { id: 'fruit',        name: 'Fruit' },
  { id: 'heart',        name: 'Heart' },
  { id: 'intersection', name: 'Intersection' },
  { id: 'library',      name: 'Library' },
  { id: 'mug',          name: 'Mug' },
  { id: 'mushroom',     name: 'Mushroom' },
  { id: 'onigiri',      name: 'Onigiri' },
  { id: 'pancake',      name: 'Pancake' },
  { id: 'pen',          name: 'Pen' },
  { id: 'pencil',       name: 'Pencil' },
  { id: 'pizza',        name: 'Pizza' },
  { id: 'pufferfish',   name: 'Pufferfish' },
  { id: 'rainbow',      name: 'Rainbow' },
  { id: 'rock',         name: 'Rock' },
  { id: 'rodent',       name: 'Rodent' },
  { id: 'snail',        name: 'Snail' },
  { id: 'snake',        name: 'Snake' },
  { id: 'star',         name: 'Star' },
  { id: 'sushi',        name: 'Sushi' },
  { id: 'transit',      name: 'Transit' },
  { id: 'vegetable',    name: 'Vegetable' },
]

export default figpals

// Curated subset shown in the avatar picker
export const pickerFigpals = [
  { id: 'figgy',       name: 'Figgy' },
  { id: 'cat',         name: 'Cat' },
  { id: 'dog',         name: 'Dog' },
  { id: 'frog',        name: 'Frog' },
  { id: 'bird',        name: 'Bird' },
  { id: 'boba',        name: 'Boba' },
  { id: 'duck',        name: 'Duck' },
  { id: 'pufferfish',  name: 'Pufferfish' },
  { id: 'mushroom',    name: 'Mushroom' },
  { id: 'pizza',       name: 'Pizza' },
  { id: 'capybara',    name: 'Capybara' },
  { id: 'rainbow',     name: 'Rainbow' },
]

export function getRandomFigpal() {
  return figpals[Math.floor(Math.random() * figpals.length)]
}

export function getFigpalSrc(id) {
  const pal = figpals.find((f) => f.id === id)
  if (!pal) return ''
  return `/figpals/FigPal ${pal.name}.svg`
}
