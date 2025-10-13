/**
 * Name generator utility for creating random workspace names
 * Format: [shape]-[color]-[object] with optional random digits
 */

const shapes = [
  'round',
  'square',
  'triangular',
  'oval',
  'rectangular',
  'diamond',
  'hexagonal',
  'circular',
  'pentagonal',
  'octagonal',
  'spherical',
  'cylindrical',
  'conical',
  'pyramidal',
  'crescent',
  'spiral',
  'zigzag',
  'wavy',
  'curved',
  'angular'
]

const colors = [
  'black',
  'white',
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'brown',
  'gray',
  'silver',
  'gold',
  'cyan',
  'magenta',
  'lime',
  'indigo',
  'violet',
  'crimson',
  'turquoise'
]

const objects = [
  'orchid',
  'diamond',
  'crystal',
  'pearl',
  'ruby',
  'sapphire',
  'emerald',
  'topaz',
  'amethyst',
  'jade',
  'opal',
  'garnet',
  'aquamarine',
  'citrine',
  'peridot',
  'moonstone',
  'tanzanite',
  'zircon',
  'tourmaline',
  'spinel'
]

/**
 * Generates a random workspace name in the format [shape]-[color]-[object]
 * @param includeDigits - Whether to append 4 random digits to make it unique
 * @returns Generated workspace name
 */
export function generateWorkspaceName(includeDigits: boolean = false): string {
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomObject = objects[Math.floor(Math.random() * objects.length)]
  
  let name = `${randomShape}-${randomColor}-${randomObject}`
  
  if (includeDigits) {
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    name += `-${randomDigits}`
  }
  
  return name
}

/**
 * Generates a workspace name and slug pair
 * @param includeDigits - Whether to append 4 random digits to make it unique
 * @returns Object with name and slug
 */
export function generateWorkspaceNameAndSlug(includeDigits: boolean = false): { name: string; slug: string } {
  const name = generateWorkspaceName(includeDigits)
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
    slug: name
  }
}

/**
 * Gets a random item from a given array
 * @param array - Array to pick from
 * @returns Random item from the array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generates multiple workspace names
 * @param count - Number of names to generate
 * @param includeDigits - Whether to append 4 random digits
 * @returns Array of generated names
 */
export function generateMultipleWorkspaceNames(count: number, includeDigits: boolean = false): string[] {
  return Array.from({ length: count }, () => generateWorkspaceName(includeDigits))
}
