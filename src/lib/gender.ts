export type PersonGender = 'male' | 'female'

/** Мужские имена на -а/-я, которые иначе попали бы в женские. */
const maleNameExceptions = new Set(['никита', 'илья', 'фома', 'кузьма', 'лука', 'савва', 'данила'])

const patronymicFemale = /(овна|евна|ична|инична)$/
const patronymicMale = /(ович|евич|ич)$/
const surnameFemale = /(ова|ева|ёва|ина|ына|ская|цкая|ая)$/
const surnameMale = /(ов|ев|ёв|ин|ын|ский|цкий|ко|ук|юк)$/
const givenNameFemale = /[ая]$/

/**
 * Пол по имени участника — только для заглушки фото: в справочнике его нет.
 * Сигналы по убыванию надёжности: отчество, фамилия, имя.
 */
export function guessGender(name: string): PersonGender {
  const words = name.trim().toLowerCase().split(/\s+/).filter(Boolean)

  for (const word of words.slice(1)) {
    if (patronymicFemale.test(word)) {
      return 'female'
    }
    if (patronymicMale.test(word)) {
      return 'male'
    }
  }

  const surname = words.length > 1 ? words[words.length - 1] : undefined
  if (surname) {
    if (surnameFemale.test(surname)) {
      return 'female'
    }
    if (surnameMale.test(surname)) {
      return 'male'
    }
  }

  const givenName = words[0]
  if (givenName) {
    if (maleNameExceptions.has(givenName)) {
      return 'male'
    }
    if (givenNameFemale.test(givenName)) {
      return 'female'
    }
  }

  return 'male'
}
