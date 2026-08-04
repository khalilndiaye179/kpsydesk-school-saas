export function getCountryDefaultSettings(countryCode?: string) {
  const code = (countryCode || 'SN').toUpperCase();
  switch (code) {
    case 'CI':
      return {
        ministry: "Ministère de l'Éducation Nationale et de l'Alphabétisation",
        ia: "Direction Régionale de l'Éducation Nationale (DRENA)",
      };
    case 'ML':
      return {
        ministry: "Ministère de l'Éducation Nationale",
        ia: "Académie d'Enseignement (AE)",
      };
    case 'TG':
      return {
        ministry: "Ministère de l'Enseignement Primaire, Secondaire et Technique",
        ia: "Direction Régionale de l'Éducation",
      };
    case 'BJ':
      return {
        ministry: "Ministère de l'Enseignement Maternelle et Primaire",
        ia: "Direction Départementale de l'Enseignement (DDEP)",
      };
    case 'BF':
      return {
        ministry: "Ministère de l'Éducation Nationale et de l'Alphabétisation",
        ia: "Direction Régionale de l'Éducation",
      };
    case 'NE':
      return {
        ministry: "Ministère de l'Éducation Nationale",
        ia: "Direction Régionale de l'Éducation",
      };
    case 'GW':
      return {
        ministry: "Ministério da Educação Nacional e Ensino Superior",
        ia: "Direcção Regional da Educação",
      };
    case 'SN':
    default:
      return {
        ministry: "Ministère de l'Éducation Nationale",
        ia: "Inspection d'Académie (IA)",
      };
  }
}
