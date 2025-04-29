/**
 * Mock educational responses for development
 * Used when the Perplexity API is not available or for testing
 */

const mockResponses = [
  {
    query: "What is machine learning?",
    content: `# Machine Learning

Machine learning is a branch of artificial intelligence (AI) and computer science that focuses on using data and algorithms to imitate the way humans learn, gradually improving its accuracy.

## Key Concepts

Machine learning algorithms build a model based on sample data, known as "training data," in order to make predictions or decisions without being explicitly programmed to do so. These algorithms are used in a wide variety of applications, such as email filtering and computer vision, where it is difficult or infeasible to develop conventional algorithms to perform the needed tasks.

## Types of Machine Learning

There are three main types of machine learning:

1. **Supervised Learning**: The algorithm is trained on labeled data, meaning that each training example is paired with an output label. The algorithm learns to predict the output from the input data.

2. **Unsupervised Learning**: The algorithm is trained on unlabeled data and left to find structure in its input on its own.

3. **Reinforcement Learning**: The algorithm learns by interacting with an environment. The algorithm receives rewards or penalties for the actions it performs and its goal is to maximize the total reward.

## Applications

Machine learning has numerous applications across various fields:

- **Healthcare**: Disease identification, patient monitoring
- **Finance**: Fraud detection, risk assessment
- **Transportation**: Self-driving cars, traffic prediction
- **Marketing**: Customer segmentation, recommendation systems
- **Natural Language Processing**: Translation, sentiment analysis

## Challenges

Despite its capabilities, machine learning faces several challenges:

- **Data Quality**: ML models are only as good as the data they're trained on
- **Interpretability**: Many ML models are "black boxes" making it difficult to understand their decision-making process
- **Bias**: Models can perpetuate or amplify biases present in training data
- **Computational Resources**: Training complex models requires significant computing power`,
    citations: [
      {
        title: "Machine Learning - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Machine_learning",
        snippet: "Machine learning (ML) is a field of study in artificial intelligence concerned with the development and study of statistical algorithms that can learn from data and generalize to unseen data, and thus perform tasks without explicit instructions."
      },
      {
        title: "What is Machine Learning? | IBM",
        url: "https://www.ibm.com/topics/machine-learning",
        snippet: "Machine learning is a branch of artificial intelligence (AI) and computer science which focuses on the use of data and algorithms to imitate the way that humans learn, gradually improving its accuracy."
      },
      {
        title: "Machine Learning: What it is and why it matters | SAS",
        url: "https://www.sas.com/en_us/insights/analytics/machine-learning.html",
        snippet: "Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention."
      }
    ],
    followUpQuestions: [
      "What's the difference between AI and machine learning?",
      "How do neural networks work?",
      "What skills do I need to learn machine learning?",
      "What are some real-world examples of machine learning applications?"
    ]
  },
  {
    query: "What's the difference between AI and machine learning?",
    content: `# Difference Between AI and Machine Learning

Artificial Intelligence (AI) and Machine Learning (ML) are related fields but have distinct differences in scope, approach, and application.

## Artificial Intelligence

AI is the broader concept of machines being able to carry out tasks in a way that we would consider "smart" or "intelligent." It encompasses the idea of creating systems that can perform tasks that typically require human intelligence, such as:

- Visual perception
- Speech recognition
- Decision-making
- Translation between languages
- Creative work

AI can be categorized into two types:

1. **Narrow or Weak AI**: Designed for a specific task (like voice assistants or chess-playing computers)
2. **General or Strong AI**: Systems with generalized human cognitive abilities that can find solutions to unfamiliar tasks

## Machine Learning

Machine Learning is a subset of AI that focuses specifically on the development of algorithms that allow computers to learn from and make predictions or decisions based on data. Rather than following explicitly programmed instructions, ML algorithms build a model based on sample data to make predictions or decisions.

Key characteristics of machine learning include:

- It requires data to learn patterns
- It improves performance with experience/more data
- It focuses on creating systems that can learn from data without being explicitly programmed

## The Relationship

Think of the relationship this way:
- **AI** is the broader concept of machines mimicking human intelligence
- **Machine Learning** is a specific approach to achieve AI
- **Deep Learning** (a subset of ML) uses neural networks with many layers to analyze various factors of data

## Practical Distinction

In practical terms:
- An AI system might use reasoning, knowledge representation, planning, and other techniques beyond just learning from data
- ML specifically focuses on algorithms that improve through experience with data
- All machine learning is AI, but not all AI is machine learning

## Examples to Illustrate the Difference

- **AI without ML**: Rule-based systems like early chess programs that use predefined rules and logic without learning capabilities
- **ML as AI**: Recommendation systems that learn your preferences from your behavior to suggest products or content
- **Beyond both**: Robotics that combines ML with other AI techniques for physical interaction with the world`,
    citations: [
      {
        title: "Artificial Intelligence vs. Machine Learning – What's the Difference? | IBM",
        url: "https://www.ibm.com/cloud/blog/ai-vs-machine-learning-vs-deep-learning-vs-neural-networks",
        snippet: "Artificial intelligence is a technology that enables a machine to simulate human behavior. Machine learning is a subset of AI which allows a machine to automatically learn from past data without programming explicitly."
      },
      {
        title: "What's the Difference Between AI, ML, and Deep Learning? | NVIDIA Blog",
        url: "https://blogs.nvidia.com/blog/2016/07/29/whats-difference-artificial-intelligence-machine-learning-deep-learning-ai/",
        snippet: "AI is the broadest term, applying to any technique that enables computers to mimic human intelligence. Machine learning is a subset of AI, and deep learning is a subset of machine learning."
      },
      {
        title: "Artificial Intelligence vs. Machine Learning: Understanding the Differences | Coursera",
        url: "https://www.coursera.org/articles/ai-vs-machine-learning",
        snippet: "While artificial intelligence encompasses the idea of a machine that can mimic human intelligence, machine learning is a specific subset of AI that trains a machine how to learn using data."
      }
    ],
    followUpQuestions: [
      "What are the ethical concerns with AI?",
      "How is deep learning different from machine learning?",
      "What programming languages are best for AI development?",
      "What are the limitations of current AI systems?"
    ]
  },
  {
    query: "Explain quantum computing",
    content: `# Quantum Computing

Quantum computing is a type of computation that harnesses the unique properties of quantum mechanics to perform calculations in fundamentally different ways than classical computers.

## Fundamental Principles

Quantum computing is based on several key quantum mechanical phenomena:

1. **Quantum Bits (Qubits)**: Unlike classical bits that can be either 0 or 1, qubits can exist in a superposition of both states simultaneously. This means a quantum computer with n qubits can represent 2^n states at once.

2. **Superposition**: Qubits can exist in multiple states at the same time, allowing quantum computers to process a vast number of possibilities simultaneously.

3. **Entanglement**: Qubits can be "entangled" so that the state of one qubit is directly related to the state of another, regardless of the distance between them. This allows quantum computers to process information in highly correlated ways.

4. **Quantum Interference**: Quantum algorithms manipulate qubits to increase the probability of correct answers and decrease the probability of wrong answers through interference patterns.

## Quantum vs. Classical Computing

The key differences between quantum and classical computing include:

- **Parallelism**: Quantum computers can process multiple possibilities simultaneously, while classical computers process sequentially.
- **Computational Complexity**: Some problems that would take classical computers billions of years can theoretically be solved by quantum computers in minutes or seconds.
- **Error Susceptibility**: Quantum systems are extremely sensitive to environmental interference, making error correction a significant challenge.

## Applications

Quantum computing has potential applications in various fields:

- **Cryptography**: Breaking current encryption methods and developing new, quantum-resistant ones
- **Drug Discovery**: Simulating molecular structures to accelerate pharmaceutical research
- **Optimization Problems**: Solving complex logistics, financial modeling, and resource allocation problems
- **Machine Learning**: Enhancing AI capabilities through quantum algorithms
- **Material Science**: Designing new materials with specific properties

## Current State of Quantum Computing

As of now, quantum computing is still in its early stages:

- Quantum computers exist but are limited in qubit count and stability
- Quantum supremacy (performing calculations beyond classical capabilities) has been demonstrated for specific problems
- Major challenges include maintaining quantum coherence, reducing error rates, and scaling up qubit numbers
- Companies like IBM, Google, Microsoft, and several startups are actively developing quantum computing technologies

## Challenges

Several significant challenges remain:

- **Decoherence**: Quantum states are fragile and can collapse due to environmental interactions
- **Error Correction**: Developing methods to correct quantum errors without disrupting computations
- **Scalability**: Building systems with enough stable qubits for practical applications
- **Programming Paradigm**: Creating new programming approaches suitable for quantum algorithms`,
    citations: [
      {
        title: "Quantum computing - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Quantum_computing",
        snippet: "Quantum computing is a type of computation whose operations can harness the phenomena of quantum mechanics, such as superposition, interference, and entanglement."
      },
      {
        title: "What is quantum computing? | IBM",
        url: "https://www.ibm.com/topics/quantum-computing",
        snippet: "Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers."
      },
      {
        title: "Quantum Computing: Progress and Prospects (2019) | The National Academies Press",
        url: "https://www.nap.edu/catalog/25196/quantum-computing-progress-and-prospects",
        snippet: "Quantum computing is the use of quantum phenomena such as superposition and entanglement to perform computation. Computers that perform quantum computations are known as quantum computers."
      }
    ],
    followUpQuestions: [
      "How do quantum computers use entanglement?",
      "What is quantum supremacy?",
      "What are the best languages for quantum computing?",
      "When will quantum computers become mainstream?"
    ]
  },
  {
    query: "How does photosynthesis work?",
    content: `# Photosynthesis: The Process of Converting Light Energy to Chemical Energy

Photosynthesis is the process by which plants, algae, and certain bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose or other sugars.

## The Basic Equation

The overall process of photosynthesis can be summarized by this chemical equation:

\`\`\`
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
\`\`\`

In words: Six molecules of carbon dioxide and six molecules of water, using light energy, produce one molecule of glucose and six molecules of oxygen.

## The Two Main Stages

Photosynthesis occurs in two main stages:

### 1. Light-Dependent Reactions (Light Reactions)

These reactions take place in the thylakoid membrane of chloroplasts:

- **Light Absorption**: Chlorophyll and other pigments in photosystems absorb light energy
- **Energy Conversion**: The absorbed light energy is converted to chemical energy in the form of ATP (adenosine triphosphate) and NADPH (nicotinamide adenine dinucleotide phosphate)
- **Water Splitting**: Water molecules are split, releasing oxygen as a byproduct
- **Electron Transport Chain**: Electrons move through a series of proteins, generating a proton gradient that drives ATP synthesis

### 2. Light-Independent Reactions (Calvin Cycle)

These reactions occur in the stroma of chloroplasts:

- **Carbon Fixation**: Carbon dioxide is incorporated into organic molecules
- **Reduction**: The ATP and NADPH from the light reactions provide energy and electrons to convert the fixed carbon into glucose
- **Regeneration**: The initial carbon acceptor is regenerated to restart the cycle

## The Role of Chloroplasts

Photosynthesis in plants and algae takes place in specialized organelles called chloroplasts, which contain:

- **Thylakoid Membranes**: Disc-shaped structures where light reactions occur
- **Grana**: Stacks of thylakoids
- **Stroma**: Fluid-filled space where the Calvin cycle occurs
- **Chlorophyll**: Green pigment that absorbs light energy

## Factors Affecting Photosynthesis

Several environmental factors influence the rate of photosynthesis:

- **Light Intensity**: Higher intensity generally increases photosynthetic rate up to a point
- **Carbon Dioxide Concentration**: Higher CO₂ levels can increase photosynthetic efficiency
- **Temperature**: Most plants have an optimal temperature range for photosynthesis
- **Water Availability**: Water is a direct reactant and affects stomatal opening
- **Nutrient Availability**: Elements like nitrogen and magnesium are needed for chlorophyll synthesis

## Ecological Importance

Photosynthesis is crucial for life on Earth because it:

- Produces oxygen for aerobic organisms
- Removes carbon dioxide from the atmosphere
- Forms the base of most food chains
- Creates and maintains atmospheric oxygen levels
- Helps regulate the global carbon cycle

## Variations in Photosynthesis

Different organisms have evolved variations in photosynthetic processes:

- **C3 Photosynthesis**: The most common type, used by most plants
- **C4 Photosynthesis**: An adaptation to hot, dry environments that reduces photorespiration
- **CAM Photosynthesis**: Used by succulents and cacti, involving nighttime CO₂ collection
- **Bacterial Photosynthesis**: Uses different pigments and doesn't always produce oxygen`,
    citations: [
      {
        title: "Photosynthesis - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Photosynthesis",
        snippet: "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities."
      },
      {
        title: "Photosynthesis | National Geographic Society",
        url: "https://www.nationalgeographic.org/encyclopedia/photosynthesis/",
        snippet: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar."
      },
      {
        title: "Photosynthesis - Biology LibreTexts",
        url: "https://bio.libretexts.org/Bookshelves/Introductory_and_General_Biology/Book%3A_General_Biology_(Boundless)/8%3A_Photosynthesis/8.2%3A_The_Light-Dependent_Reactions_of_Photosynthesis",
        snippet: "The light-dependent reactions of photosynthesis convert light energy into chemical energy, producing ATP and NADPH. These reactions take place in the thylakoid membrane of the chloroplast."
      }
    ],
    followUpQuestions: [
      "What's the difference between C3 and C4 photosynthesis?",
      "How do plants adapt photosynthesis to different environments?",
      "Why are some plants green and others different colors?",
      "How does artificial photosynthesis work?"
    ]
  },
  {
    query: "Explain the theory of relativity",
    content: `# Theory of Relativity

The Theory of Relativity, developed by Albert Einstein, revolutionized our understanding of space, time, and gravity. It consists of two related theories: Special Relativity (1905) and General Relativity (1915).

## Special Relativity

Special Relativity addresses the relationship between space and time, and how they appear relative to observers moving at constant speeds relative to each other. Its two fundamental postulates are:

1. **The Principle of Relativity**: The laws of physics are the same for all observers in uniform motion relative to one another.

2. **The Constancy of the Speed of Light**: The speed of light in a vacuum is the same for all observers, regardless of their relative motion or the motion of the light source.

### Key Consequences of Special Relativity

- **Time Dilation**: Moving clocks run slower relative to stationary observers. As an object approaches the speed of light, time passes more slowly for it compared to a stationary observer.

- **Length Contraction**: Objects appear shorter in the direction of motion as their speed increases.

- **Mass-Energy Equivalence**: Expressed in Einstein's famous equation E=mc², which states that energy (E) equals mass (m) times the speed of light (c) squared. This implies that mass and energy are interchangeable.

- **Relativity of Simultaneity**: Events that appear simultaneous to one observer may not appear simultaneous to another observer moving relative to the first.

## General Relativity

General Relativity extends Special Relativity to include gravity and acceleration. Its core principle is:

- **The Equivalence Principle**: The effects of gravity and acceleration are indistinguishable. A person in a closed elevator cannot determine whether they are accelerating upward or being pulled down by gravity.

### Key Concepts in General Relativity

- **Spacetime Curvature**: Gravity is not a force but a curvature of spacetime caused by mass and energy. Massive objects like stars and planets create a "dent" in the fabric of spacetime.

- **Gravitational Time Dilation**: Time passes more slowly in stronger gravitational fields. Clocks on Earth run slightly slower than clocks in orbit.

- **Gravitational Lensing**: Light follows curved paths when passing through warped spacetime near massive objects, causing distant objects to appear in different positions or even as multiple images.

- **Gravitational Waves**: Ripples in spacetime caused by accelerating masses, such as colliding black holes or neutron stars. These waves were first directly detected in 2015, confirming a major prediction of General Relativity.

## Experimental Confirmations

The Theory of Relativity has been confirmed by numerous experiments:

- **Bending of Light**: During a solar eclipse in 1919, stars near the sun appeared slightly out of position, confirming that the sun's gravity bends light.

- **Mercury's Orbit**: General Relativity correctly predicted anomalies in Mercury's orbit that Newtonian physics couldn't explain.

- **GPS Satellites**: GPS systems must account for both special and general relativistic effects to maintain accuracy.

- **Gravitational Waves**: The LIGO and Virgo detectors have observed gravitational waves from merging black holes and neutron stars.

## Implications and Applications

The Theory of Relativity has profound implications for our understanding of the universe:

- It provides the framework for understanding black holes, the expansion of the universe, and the Big Bang.
- It's essential for technologies like GPS navigation systems.
- It predicts phenomena like frame-dragging and gravitational time dilation.
- It forms the basis for modern cosmology and our understanding of the universe's structure and evolution.

## Limitations

Despite its success, the Theory of Relativity has limitations:

- It doesn't fully integrate with quantum mechanics, leading to the ongoing search for a theory of quantum gravity.
- It breaks down at singularities, such as the center of black holes or the Big Bang itself.`,
    citations: [
      {
        title: "Theory of relativity - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Theory_of_relativity",
        snippet: "The theory of relativity usually encompasses two interrelated theories by Albert Einstein: special relativity and general relativity, proposed and published in 1905 and 1915, respectively."
      },
      {
        title: "What Is the Theory of Relativity? | Space",
        url: "https://www.space.com/17661-theory-general-relativity.html",
        snippet: "The theory of relativity is a scientific theory describing the relationship between space and time. Albert Einstein developed the theory as a way to resolve issues with previous physical theories."
      },
      {
        title: "Einstein's Theory of General Relativity | Space.com",
        url: "https://www.space.com/17661-theory-general-relativity.html",
        snippet: "General relativity is physicist Albert Einstein's understanding of how gravity affects the fabric of space-time. The theory, published in 1915, expanded the theory of special relativity that he had published 10 years earlier."
      }
    ],
    followUpQuestions: [
      "How does relativity affect time travel possibilities?",
      "What is the twin paradox in special relativity?",
      "How do black holes relate to Einstein's theories?",
      "What is the relationship between relativity and quantum mechanics?"
    ]
  }
];

// Function to get a mock response based on query
const getMockResponse = (query, level = 'intermediate') => {
  // Try to find an exact match first
  const exactMatch = mockResponses.find(
    response => response.query.toLowerCase() === query.toLowerCase()
  );
  
  if (exactMatch) {
    return {
      content: exactMatch.content,
      citations: exactMatch.citations,
      followUpQuestions: exactMatch.followUpQuestions
    };
  }
  
  // If no exact match, find the most relevant response based on keywords
  const words = query.toLowerCase().split(' ');
  let bestMatch = null;
  let highestScore = 0;
  
  mockResponses.forEach(response => {
    const responseWords = response.query.toLowerCase().split(' ');
    let matchScore = 0;
    
    words.forEach(word => {
      if (word.length > 3 && responseWords.includes(word)) {
        matchScore += 1;
      }
    });
    
    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = response;
    }
  });
  
  // If we found a relevant match
  if (bestMatch && highestScore > 0) {
    return {
      content: bestMatch.content,
      citations: bestMatch.citations,
      followUpQuestions: bestMatch.followUpQuestions
    };
  }
  
  // Default response if no match found
  return {
    content: `# Response to: "${query}"

I don't have specific information about this topic in my knowledge base. Here's some general guidance:

## Understanding the Topic

This appears to be a question about ${query.split(' ').slice(-3).join(' ')}. To learn more about this subject, you might want to:

1. **Research Basic Concepts**: Start with fundamental principles related to this topic
2. **Explore Related Fields**: Look into connected areas of study
3. **Find Authoritative Sources**: Seek information from academic journals, textbooks, or recognized experts

## Learning Approach

When learning about a new topic:

- Begin with introductory materials
- Build a foundation of key terminology
- Progress to more complex concepts
- Apply critical thinking to evaluate information

Would you like to ask about a different topic or rephrase your question?`,
    citations: [
      {
        title: "General Knowledge Resources",
        url: "https://www.wikipedia.org",
        snippet: "Wikipedia is a free online encyclopedia that allows users to access information on a wide variety of topics."
      }
    ],
    followUpQuestions: [
      "Can you explain the basic principles of this topic?",
      "What are the most important concepts to understand first?",
      "Who are the leading experts in this field?",
      "What are some practical applications of this knowledge?"
    ]
  };
};

// Function to generate a mock learning path
const generateMockLearningPath = (topic, level = 'intermediate') => {
  return {
    pathId: `mock-path-${Date.now()}`,
    title: `Learning Path: ${topic}`,
    content: `# Learning Path: ${topic}

## Introduction to ${topic}
This learning path will guide you through understanding ${topic} from the fundamentals to advanced concepts. This path is designed for ${level} learners.

### Key Concepts to Understand
- Basic terminology and definitions
- Historical development of ${topic}
- Core principles and theories
- Practical applications

## Fundamentals of ${topic}
Start by understanding the basic concepts that form the foundation of ${topic}.

### Learning Objectives:
- Understand the definition and scope of ${topic}
- Learn the historical context and development
- Identify key figures and their contributions
- Grasp the fundamental principles

### Resources:
- Introductory textbooks on ${topic}
- Online courses covering the basics
- Fundamental research papers
- Educational videos explaining core concepts

## Intermediate Concepts
Once you have a solid foundation, move on to more complex aspects of ${topic}.

### Learning Objectives:
- Analyze the relationships between different components
- Apply theoretical knowledge to simple problems
- Understand current research directions
- Develop critical thinking about ${topic}

### Resources:
- Advanced textbooks and academic papers
- Case studies and practical examples
- Interactive learning tools
- Community forums and discussion groups

## Advanced Applications
At this stage, focus on applying your knowledge to real-world situations.

### Learning Objectives:
- Solve complex problems related to ${topic}
- Contribute to discussions with informed perspectives
- Evaluate current trends and future directions
- Connect ${topic} to other fields of knowledge

### Resources:
- Specialized academic journals
- Industry reports and case studies
- Expert interviews and lectures
- Hands-on projects and experiments

## Mastery and Specialization
Finally, choose a specific area within ${topic} to develop deeper expertise.

### Learning Objectives:
- Develop specialized knowledge in a sub-field
- Stay current with cutting-edge research
- Contribute original ideas or applications
- Connect with experts and communities

### Resources:
- Cutting-edge research papers
- Professional networks and conferences
- Advanced projects and collaborations
- Continuing education opportunities

## Assessment and Progress Tracking
Throughout your learning journey, regularly assess your understanding:

- Create concept maps connecting ideas
- Explain concepts to others in your own words
- Apply knowledge to solve increasingly complex problems
- Reflect on your learning process and adjust as needed`,
    level,
    topic,
    citations: [
      {
        title: `Introduction to ${topic} - Educational Resource`,
        url: `https://example.com/intro-to-${topic.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `A comprehensive introduction to ${topic} covering fundamental concepts, historical context, and basic principles.`
      },
      {
        title: `${topic} for ${level.charAt(0).toUpperCase() + level.slice(1)} Learners`,
        url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-${level}-guide`,
        snippet: `This resource provides a structured approach to learning ${topic} specifically designed for ${level} learners with appropriate depth and complexity.`
      }
    ]
  };
};

module.exports = {
  getMockResponse,
  generateMockLearningPath,
  mockResponses
};
