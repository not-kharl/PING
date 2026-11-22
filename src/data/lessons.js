export const lessons = [
    {
      id: '1',
      title: 'Module 1 - Introduction',
      subtitle: 'Networks, addresses, ports and packets',
      topic:
        'This module introduces what a network is, how devices are addressed, how data travels in packets, and how networks are connected together.',
      fromReference: true,
      sections: [
        {
          heading: 'What is a network?',
          body: 'A network is a group of computers and other devices linked together so they can exchange data. Each device on it is called a node, and every node has its own unique address.',
        },
        {
          heading: 'Network addresses',
          body: 'Computers work easily with numeric addresses, such as four numbers separated by dots (for example 136.102.233.49). The first part of the address identifies the network and the rest identifies the host machine. A registry organization hands out address ranges by country, organization and department.',
        },
        {
          heading: 'Domain names (DNS)',
          body: 'People find names easier to remember than numbers. DNS servers translate a readable name, like a website address, into the numeric address a computer needs.',
        },
        {
          heading: 'Ports',
          body: 'An IP address identifies a machine. A port number identifies one specific application running on that machine. Common ports: HTTP 80, FTP 20 and 21, Telnet 23, SMTP (email) 25, POP3 (email) 110.',
        },
        {
          heading: 'Packet switching',
          body: 'Modern networks break a message into small units called packets. Each packet has a header (source and destination addresses plus sequencing information) and a data area. The receiver uses the headers to put the pieces back together in the right order.',
        },
        {
          heading: 'LANs and WANs',
          body: 'A WAN covers cities, countries and continents (examples: ATM, ISDN). A LAN covers a building or a group of nearby buildings (examples: Ethernet on a shared bus, token ring, and FDDI fiber rings).',
        },
        {
          heading: 'Connecting networks',
          body: 'A backbone is a high-capacity network that links smaller ones. A bridge links two similar LANs that use the same protocol. A router connects different networks. A bridge/router does both jobs. A gateway connects two different systems by translating between their protocols.',
        },
        {
          heading: 'Network topology diagrams',
          body: 'A topology diagram shows where the parts of a network are located, how the LANs and WANs are laid out, and which connecting devices (routers, bridges, repeaters, gateways) join them.',
        },
      ],
    },
    {
      id: '2',
      title: 'Module 2 - Protocols',
      subtitle: 'The rules computers follow to communicate',
      topic:
        'This module explains what protocols are, what they do, how they are described, and why they are built in layers.',
      fromReference: true,
      sections: [
        {
          heading: 'What is a protocol?',
          body: 'A protocol is a set of rules that governs how two computers on a network communicate with each other.',
        },
        {
          heading: 'What protocols do',
          body: 'Protocols handle addressing and routing of messages, detecting and recovering from errors, and controlling the order and flow of data.',
        },
        {
          heading: 'Syntax and semantics',
          body: 'A protocol specification has two parts. The syntax defines the kinds and formats of the messages that are exchanged. The semantics define what each side does when specific events happen. HTTP, used between web browsers and web servers, is one example.',
        },
        {
          heading: 'Example: an email conversation',
          body: 'In SMTP, the sending computer issues commands such as MAIL FROM, RCPT TO and DATA, and the receiving server answers each one with a status code such as 250 (OK). The two sides take turns, following the rules step by step.',
        },
        {
          heading: 'RFCs',
          body: 'A Request For Comments (RFC) is a document that publishes the specification of an Internet protocol. For example, RFC 821 describes the conversation between an SMTP client and server.',
        },
        {
          heading: 'Layered design',
          body: "Protocols are designed in layers, as in the OSI reference model. A layer works with the layer directly below it. Data units pass up and down through the layers, and each layer adds or removes its own header, so what is one layer's data unit becomes the data of the layer below.",
        },
      ],
    },
    {
      id: '3',
      title: 'Module 3 - Protocol Layers',
      subtitle: 'The OSI model and the TCP/IP model',
      topic:
        'This module covers the seven layers of the OSI model and the four layers of the TCP/IP model, and how they relate.',
      fromReference: true,
      sections: [
        {
          heading: 'The OSI model',
          body: 'OSI (Open Systems Interconnection) is an ISO standard for designing and running computer networks. It has seven layers. When data is sent, each layer from top to bottom adds its own header. When it is received, the headers are removed in reverse order until the data reaches the application.',
        },
        {
          heading: 'The seven OSI layers (bottom to top)',
          body: '1. Physical: the electrical and physical side of sending bits.\n2. Data link: packages data for the physical network and moves it safely across it.\n3. Network: carries packets from a source to a destination.\n4. Transport: end-to-end delivery with error detection and correction.\n5. Session: manages sessions between applications.\n6. Presentation: standard data formats, compression and encryption.\n7. Application: the programs the user works with.',
        },
        {
          heading: 'The TCP/IP model',
          body: 'TCP/IP uses only four layers: Application, Transport, Internet and Network (the layer that gives access to the physical network).',
        },
        {
          heading: 'What each TCP/IP layer does',
          body: 'Network: maps IP addresses to physical addresses and wraps IP datagrams in a format the network understands.\nInternet: the heart of TCP/IP. It uses the Internet Protocol (IP) to move data from place A to place B.\nTransport: built on two main protocols, TCP and UDP.\nApplication: combines the OSI application, presentation and session layers, with protocols such as HTTP, FTP and SMTP.',
        },
      ],
    },
    {
      id: '4',
      title: 'Module 4 - Network Interconnection and the Internet',
      subtitle: 'IP, TCP, UDP and Internet applications',
      topic:
        'This module explains how different networks are joined into the Internet using IP, and how TCP, UDP and the common application protocols work on top of it.',
      fromReference: true,
      sections: [
        {
          heading: 'Why interconnect networks?',
          body: 'Networks that use different protocols can only be joined if they share a common protocol above their local ones. The Internet Protocol (IP) plays that role by giving every network and host a unique address. The idea began with early research networks such as ARPANET.',
        },
        {
          heading: 'Internet Protocol (IP)',
          body: 'IP splits data into packets of a standard size (datagrams) and reassembles them at the destination. It also routes each packet across successive networks to the destination IP address. IP is connectionless: it sets up no connection first, does not check for errors, and does not guarantee delivery.',
        },
        {
          heading: 'How datagrams travel',
          body: 'Each datagram has a header with the destination information. It is sent to a gateway (router) that links the local network to a provider network, then passed from gateway to gateway until it reaches its destination. Packets of the same message can take different paths.',
        },
        {
          heading: 'Structure of an IP packet',
          body: 'The header at the start of the packet holds the control fields, including a 32-bit source address, a 32-bit destination address, a checksum and options. The data follows. An IP packet can be at most about 64 KB long.',
        },
        {
          heading: 'Transmission Control Protocol (TCP)',
          body: 'TCP builds a reliable service on top of IP: error detection, safe delivery and data that arrives in the correct order. It is connection-oriented, so the two computers first open a connection with a handshake (SYN, SYN-ACK, ACK) and later close it (FIN). TCP can send a long stream of data by splitting it into numbered packets that are reassembled on arrival. It offers 65,536 ports.',
        },
        {
          heading: 'User Datagram Protocol (UDP)',
          body: 'UDP is also built on IP and offers 65,536 ports, but it is connectionless and does no error checking. Because it does no extra verification, it is very fast, which suits small, repeated messages such as time information. Every machine has two sets of ports: one for TCP and one for UDP.',
        },
        {
          heading: 'Internet application protocols',
          body: 'FTP transfers files between two machines.\nTelnet connects to a remote host in terminal mode.\nNNTP supports newsgroups.\nSMTP provides basic email service.\nSNMP is used to manage the network.\nAll of them run on TCP or UDP over IP.',
        },
      ],
    },
    {
      id: '5',
      title: 'Module 5 - Cisco Networking',
      subtitle: 'Build a network like in Cisco Packet Tracer',
      topic:
        'This module shows how Cisco-style networks connect computers using switches, routers and cables, how IP addressing makes devices reachable, and how to configure devices from the command line. Practice everything in the Playground tab.',
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
          body: 'Cisco devices run IOS. User EXEC (Router>) is limited. Privileged EXEC (Router#) is entered with "enable". Global config (Router(config)#) is entered with "configure terminal". Interface config (Router(config-if)#) is entered with "interface g0/0/0". Commands can be shortened, like "en" or "conf t".',
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
          body: 'In the Playground tab:\n1. Add PC1, PC2 and R1. Cable PC1 to R1 and PC2 to R1.\n2. On R1 type: enable, configure terminal, interface g0/0/0, ip address 192.168.1.1 255.255.255.0, no shutdown, exit.\n3. Then: interface g0/0/1, ip address 192.168.2.1 255.255.255.0, no shutdown, end.\n4. PC1: ipconfig 192.168.1.2 255.255.255.0 192.168.1.1\n5. PC2: ipconfig 192.168.2.2 255.255.255.0 192.168.2.1\n6. On PC1 type: ping 192.168.2.2. Use "show ip interface brief" on R1 to check the ports.',
        },
      ],
    },
  ];