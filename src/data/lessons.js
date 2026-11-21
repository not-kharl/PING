export const lessons = [
    {
        id: '1',
        title: 'Lesson 1 - Learning The Basics',
        subtitle: 'What a network is and how devices talk',
        topic: 'This lesson introduces the core ideas of computer networking: what a network is, why we use one, and the basic parts that make it work.',
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
    {
        id: '2',
        title: 'Lesson 2 - Cisco Networking',
        subtitle: 'Build a network like in Cisco Packet Tracer',
        topic: 'This lesson shows how Cisco-style networks connect computers using switches, routers and cables, how IP addressing makes devices reachable, and how to configure devices from the command line. Practice everything in the Playground tab.',
        interactive: true,
        sections: [
            {
                heading: 'End devices',
                body: 'PCs, laptops and phones are end devices. They create and receive data, but they need a switch or router to reach each other.',
            },
            {
                heading: 'Switch',
                body: "A switch connects devices in the same LAN. It learns each device's MAC address and forwards data only to the port that needs it.",
            },
            {
                heading: 'Router',
                body: 'A router connects different networks and decides the best path for data. A PC uses its default gateway (the router) to reach other networks.',
            },
            {
                heading: 'Cables',
                body: 'Straight-through cables connect unlike devices (PC to switch, switch to router). Crossover cables connect like devices (PC to PC, switch to switch).',
            },
            {
                heading: 'IP addressing on a PC',
                body: 'Every PC needs its own IP address, such as 192.168.1.2: four numbers from 0 to 255 separated by dots. Two devices must never share the same address. In the Playground, tap a PC and type: ipconfig 192.168.1.2 255.255.255.0',
            },
            {
                heading: 'Subnet mask',
                body: 'The subnet mask (for example 255.255.255.0) tells a device which part of the address is the network and which part is the host. With that mask, 192.168.1.2 and 192.168.1.3 share the network 192.168.1.x, so they can talk directly. 192.168.2.3 is on a different network.',
            },
            {
                heading: 'Default gateway',
                body: "To reach a device on another network, a PC sends its traffic to the default gateway. This is the router's IP address on the PC's own network, for example 192.168.1.1.",
            },
            {
                heading: 'How ping decides success',
                body: 'Ping sends a small test message and waits for a reply. It succeeds only when: 1) both devices have valid IP addresses, 2) cables connect them (through switches), and 3) they are on the same network, or a router with correct gateways joins them. If any piece is wrong you get "Request timed out".',
            },
            {
                heading: 'Cisco IOS modes',
                body: 'Cisco devices run IOS. User EXEC (Router>) is limited. Privileged EXEC (Router#) is entered with "enable". Global config (Router(config)#) is entered with "configure terminal". Interface config (Router(config-if)#) is entered with "interface g0/0". Commands can be shortened, like "en" or "conf t".',
            },
            {
                heading: 'Using the console',
                body: 'Open the Playground tab and tap any device to open its console below the canvas. PCs use simple commands (ipconfig, ping). Routers and switches use Cisco IOS commands. Type "help" to list what works in the current mode, or tap a command in the list under the console.',
            },
            {
                heading: 'Try it 1: one network',
                body: 'In the Playground tab:\n1. Add PC1, PC2 and SW1.\n2. Switch to Cable mode and connect PC1 to SW1, and PC2 to SW1.\n3. Tap PC1 and type: ipconfig 192.168.1.2 255.255.255.0\n4. Tap PC2 and type: ipconfig 192.168.1.3 255.255.255.0\n5. On PC2 type: ping 192.168.1.2 (it works).\n6. Now change PC2 to 192.168.2.3 and ping again to see it fail.',
            },
            {
                heading: 'Try it 2: two networks with a router',
                body: 'In the Playground tab:\n1. Add PC1, PC2 and R1. Cable PC1 to R1 and PC2 to R1.\n2. On R1 type: enable, configure terminal, interface g0/0, ip address 192.168.1.1 255.255.255.0, no shutdown, exit.\n3. Then: interface g0/1, ip address 192.168.2.1 255.255.255.0, no shutdown, end.\n4. PC1: ipconfig 192.168.1.2 255.255.255.0 192.168.1.1\n5. PC2: ipconfig 192.168.2.2 255.255.255.0 192.168.2.1\n6. On PC1 type: ping 192.168.2.2. Use "show ip interface brief" on R1 to check the ports.',
            },
        ],
    },
];
