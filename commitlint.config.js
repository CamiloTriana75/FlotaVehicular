export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bug
        'docs', // Cambios en documentación
        'style', // Cambios de formato, espacios, etc.
        'refactor', // Refactorización de código
        'test', // Agregar o corregir tests
        'chore', // Cambios en herramientas, configuración, etc.
        'perf', // Mejoras de performance
        'ci', // Cambios en CI/CD
        'build', // Cambios en build system
        'revert', // Revertir commits
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
  },
};
