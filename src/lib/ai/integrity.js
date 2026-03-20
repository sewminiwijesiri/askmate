export function isSolutionSeeking(question) {
  const patterns = [
    /do my assignment/i,
    /give (me )?(the )?full answer/i,
    /write (complete |entire )?code/i,
    /final essay/i,
    /entire solution/i,
    /solve this for me/i,
    /can you do my/i,
    /complete the/i,
  ];

  return patterns.some((pattern) => pattern.test(question));
}

export function buildIntegrityResponse(moduleName) {
  return `I cannot provide a complete solution for your assignment as it would violate academic integrity. However, I can help you understand the concepts in **${moduleName}** so you can solve it yourself! 

Would you like me to explain the underlying concept or provide a hint to get you started?`;
}
