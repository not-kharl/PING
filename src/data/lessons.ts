export type Lesson = {
    id: string;
    title: string;
    subtitle: string;
    topic: string;
    sections: { heading: string; body: string }[];
  };
  
  export const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Lesson 1 - Learning The Basics',
      subtitle: 'What a network is and how devices talk',
      topic:
        'This lesson introduces the core ideas of computer networking: what a network is, why we use one, and the basic parts that make it work.',
      sections: [
        {
          heading: 'What is a network?',
          body: 'A network is a group of connected devices (computers, phones, printers) that share data and resources with each other.',
        },
        {
          heading: 'Common devices',
          body: 'Routers connect different networks together. Switches connect devices within the same network. Access points provide wireless connections.',
        },
        {
          heading: 'IP addresses',
          body: 'Every device on a network has an IP address, which works like a mailing address so data knows where to go.',
        },
        {
          heading: 'Network types',
          body: 'LAN covers a small area like a home or school. WAN covers large areas. The Internet is the largest WAN of all.',
        },
      ],
    },
  ];