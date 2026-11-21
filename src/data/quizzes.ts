export type Question = {
    q: string;
    options: string[];
    answer: number;
    explain: string;
};

export type Quiz = {
    id: string;
    lessonId: string;
    title: string;
    subtitle: string;
    passPercent: number;
    lab?: boolean;
    questions: Question[];
};

export const quizzes: Quiz[] = [
    {
        id: '1',
        lessonId: '1',
        title: 'Quiz 1 - Networking Basics',
        subtitle: 'Check what you learned in Lesson 1',
        passPercent: 60,
        questions: [
            {
                q: 'What is a network?',
                options: [
                    'A single computer running many programs',
                    'A group of connected devices that share data and resources',
                    'A cable that connects a printer',
                    'A website on the Internet',
                ],
                answer: 1,
                explain:
                    'A network is a group of connected devices (computers, phones, printers) that share data and resources.',
            },
            {
                q: 'Which device connects different networks together?',
                options: ['Switch', 'Printer', 'Router', 'Access point'],
                answer: 2,
                explain:
                    'Routers connect different networks. Switches connect devices inside the same network.',
            },
            {
                q: 'What is an IP address used for?',
                options: [
                    'Giving a device an address so data knows where to go',
                    'Making a connection faster',
                    'Storing files',
                    'Protecting a device from viruses',
                ],
                answer: 0,
                explain: 'An IP address works like a mailing address for data.',
            },
            {
                q: 'Which network type covers a small area such as a home or school?',
                options: ['WAN', 'LAN', 'The Internet', 'The cloud'],
                answer: 1,
                explain: 'A LAN covers a small area. A WAN covers large areas.',
            },
            {
                q: 'What is the largest WAN in the world?',
                options: ['A school network', 'Home Wi-Fi', 'The Internet', 'A switch'],
                answer: 2,
                explain: 'The Internet is the largest WAN of all.',
            },
        ],
    },
    {
        id: '2',
        lessonId: '2',
        title: 'Quiz 2 - Cisco Networking',
        subtitle: 'Questions plus a hands-on lab from Lesson 2',
        passPercent: 60,
        lab: true,
        questions: [
            {
                q: 'Which command moves you from Router> to Router#?',
                options: ['configure terminal', 'enable', 'interface g0/0', 'exit'],
                answer: 1,
                explain: '"enable" enters Privileged EXEC mode (Router#).',
            },
            {
                q: 'Which command enters global configuration mode?',
                options: [
                    'configure terminal',
                    'enable',
                    'show running-config',
                    'no shutdown',
                ],
                answer: 0,
                explain: '"configure terminal" gives you Router(config)#.',
            },
            {
                q: 'The prompt Router(config-if)# means you are...',
                options: [
                    'In User EXEC mode',
                    'Configuring a network interface',
                    'Viewing the running config',
                    'Logged out',
                ],
                answer: 1,
                explain: 'config-if is interface configuration mode.',
            },
            {
                q: 'Which command turns a router port on?',
                options: ['shutdown', 'ip address', 'no shutdown', 'hostname'],
                answer: 2,
                explain: 'Router ports start shut down. "no shutdown" turns them on.',
            },
            {
                q: 'Which cable normally connects a PC to a switch?',
                options: [
                    'Crossover cable',
                    'Straight-through cable',
                    'Rollover to the PC',
                    'No cable is needed',
                ],
                answer: 1,
                explain:
                    'Straight-through cables connect unlike devices, such as a PC to a switch.',
            },
            {
                q: 'With mask 255.255.255.0, which address is on the same network as 192.168.1.2?',
                options: ['192.168.2.2', '192.168.1.3', '10.0.0.2', '172.16.1.2'],
                answer: 1,
                explain: 'The first three numbers (192.168.1) must match.',
            },
            {
                q: 'What is a default gateway?',
                options: [
                    "The router's IP address that a PC uses to reach other networks",
                    'The name of the PC',
                    'The cable plugged into the switch',
                    'The subnet mask',
                ],
                answer: 0,
                explain:
                    "The default gateway is the router's address on the PC's own network.",
            },
        ],
    },
];