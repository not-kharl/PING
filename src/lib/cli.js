import {
    ROUTER_PORTS,
    configuredIps,
    ipToNum,
    isHostAddress,
    isValidMask,
    networkOf,
    pingCheck,
} from './network';
  
  export const defaultSession = { mode: 'user' };
  
  export function promptFor(d, s) {
    if (d.kind === 'pc') return 'C:\\>';
    switch (s.mode) {
      case 'user':
        return `${d.name}>`;
      case 'priv':
        return `${d.name}#`;
      case 'config':
        return `${d.name}(config)#`;
      default:
        return `${d.name}(config-if)#`;
    }
  }
  
  const w = (s) => (s ?? '').toLowerCase();
  
  // Cisco-style abbreviations: "conf" matches "configure", "sh" matches "show"
  const is = (tok, full, min = 1) => {
    const x = w(tok);
    return x.length >= min && full.startsWith(x);
  };
  
  const patch = (devices, id, p) =>
    devices.map((d) => (d.id === id ? { ...d, ...p } : d));
  
  // Device names: up to 12 letters, numbers, - or _, starting with a letter, and unique
  const NAME_RE = /^[A-Za-z][A-Za-z0-9_-]{0,11}$/;
  function checkName(name, dev, devices) {
    if (!name) return 'Incomplete command. Use: hostname <name>';
    if (!NAME_RE.test(name))
      return 'Invalid name. Use up to 12 letters, numbers, - or _, starting with a letter.';
    const clash = devices.find(
      (d) => d.id !== dev.id && d.name.toLowerCase() === name.toLowerCase()
    );
    if (clash) return `The name ${name} is already used by another device.`;
    return null;
  }
  
  function pcPing(target, r) {
    if (r.ok)
      return [
        `Pinging ${target} with 32 bytes of data:`,
        '',
        ...new Array(4).fill(`Reply from ${target}: bytes=32 time<1ms TTL=128`),
        '',
        `Ping statistics for ${target}:`,
        '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
      ];
    return [
      `Pinging ${target} with 32 bytes of data:`,
      '',
      ...new Array(4).fill('Request timed out.'),
      '',
      `Ping statistics for ${target}:`,
      '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)',
      `Hint: ${r.hint}`,
    ];
  }
  
  function iosPing(target, r) {
    const head = [
      'Type escape sequence to abort.',
      `Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`,
    ];
    return r.ok
      ? [...head, '!!!!!', 'Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms']
      : [...head, '.....', 'Success rate is 0 percent (0/5)', `Hint: ${r.hint}`];
  }
  
  function ipBrief(dev) {
    const head = 'Interface              IP-Address      OK? Method Status                Protocol';
    if (dev.kind !== 'router')
      return [
        head,
        `${'Vlan1'.padEnd(22)} ${'unassigned'.padEnd(15)} YES unset  ${'administratively down'.padEnd(21)} down`,
      ];
    return [
      head,
      ...Object.entries(dev.ifaces).map(
        ([n, i]) =>
          `${n.padEnd(22)} ${(i.ip ?? 'unassigned').padEnd(15)} YES ${
            i.ip ? 'manual' : 'unset '
          } ${(i.up ? 'up' : 'administratively down').padEnd(21)} ${i.up ? 'up' : 'down'}`
      ),
    ];
  }
  
  function runningConfig(dev) {
    const lines = [
      'Building configuration...',
      '',
      'Current configuration:',
      '!',
      `hostname ${dev.name}`,
      '!',
    ];
    if (dev.kind === 'router')
      for (const [n, i] of Object.entries(dev.ifaces))
        lines.push(
          `interface ${n}`,
          i.ip && i.mask ? ` ip address ${i.ip} ${i.mask}` : ' no ip address',
          i.up ? ' no shutdown' : ' shutdown',
          '!'
        );
    lines.push('end');
    return lines;
  }
  
  function helpFor(mode) {
    switch (mode) {
      case 'user':
        return ['Commands:', '  enable', '  ping <ip>', '  show ip interface brief', '  clear'];
      case 'priv':
        return [
          'Commands:',
          '  configure terminal',
          '  show running-config',
          '  show ip interface brief',
          '  ping <ip>',
          '  write memory',
          '  disable',
          '  clear',
        ];
      case 'config':
        return [
          'Commands:',
          '  hostname <name>      rename this device',
          '  interface <port>     (routers, e.g. g0/0/0)',
          '  exit',
          '  end',
        ];
      default:
        return ['Commands:', '  ip address <ip> <mask>', '  no shutdown', '  shutdown', '  exit', '  end'];
    }
  }
  
  function runPc(t, dev, devices, links) {
    const done = (out, next = devices) => ({
      out,
      devices: next,
      session: defaultSession,
    });
    const cmd = w(t[0]);
  
    if (cmd === 'help' || cmd === '?')
      return done([
        'Commands:',
        '  ipconfig                          show IP settings',
        '  ipconfig <ip> <mask> [gateway]    set IP settings',
        '  hostname <name>                   rename this PC',
        '  ping <ip>                         test connectivity',
        '  clear                             clear the screen',
      ]);
  
    if (cmd === 'hostname') {
      if (t.length === 1) return done([dev.name]);
      const err = checkName(t[1], dev, devices);
      if (err) return done([err]);
      return done(
        [`Host name changed to ${t[1]}.`],
        patch(devices, dev.id, { name: t[1] })
      );
    }
  
    if (cmd === 'ipconfig') {
      if (t.length === 1)
        return done([
          `   IPv4 Address. . . . . : ${dev.ip ?? '0.0.0.0'}`,
          `   Subnet Mask . . . . . : ${dev.mask ?? '0.0.0.0'}`,
          `   Default Gateway . . . : ${dev.gateway ?? '0.0.0.0'}`,
        ]);
      const [, ip, mask, gw] = t;
      if (!ip || !mask) return done(['Usage: ipconfig <ip> <mask> [gateway]']);
      if (ipToNum(ip) === null) return done(['Invalid IP address.']);
      if (!isValidMask(mask)) return done(['Invalid subnet mask.']);
      if (!isHostAddress(ip, mask))
        return done(['That is a network or broadcast address and cannot be used by a host.']);
      if (gw && ipToNum(gw) === null) return done(['Invalid default gateway.']);
      const clash = devices.find((d) => d.id !== dev.id && configuredIps(d).includes(ip));
      if (clash)
        return done([`IP address conflict: ${ip} is already used by ${clash.name}.`]);
      return done(
        [`${dev.name}: ${ip} / ${mask}${gw ? `, gateway ${gw}` : ''}`],
        patch(devices, dev.id, { ip, mask, gateway: gw })
      );
    }
  
    if (cmd === 'ping') {
      const target = t[1];
      if (!target || ipToNum(target) === null) return done(['Usage: ping <ip-address>']);
      return done(pcPing(target, pingCheck(dev, target, devices, links)));
    }
  
    return done(['Invalid command. Type "help" to see the commands.']);
  }
  
  function runIos(t, dev, session, devices, links) {
    const done = (out, next = devices, s = session) => ({
      out,
      devices: next,
      session: s,
    });
    const bad = () => done(["% Invalid input detected at '^' marker."]);
    const [c0, c1, c2, c3] = t;
    const mode = session.mode;
  
    if (c0 === '?' || is(c0, 'help', 4)) return done(helpFor(mode));
  
    if (mode === 'user' || mode === 'priv') {
      if (is(c0, 'ping', 2)) {
        if (!c1 || ipToNum(c1) === null) return done(['% Usage: ping <ip-address>']);
        return done(iosPing(c1, pingCheck(dev, c1, devices, links)));
      }
      if (is(c0, 'show', 2)) {
        if (is(c1, 'ip', 2) && is(c2, 'interface', 1) && is(c3, 'brief', 1))
          return done(ipBrief(dev));
        if (mode === 'priv' && is(c1, 'running-config', 1)) return done(runningConfig(dev));
        return bad();
      }
    }
  
    if (mode === 'user') {
      if (is(c0, 'enable', 2)) return done([], devices, { mode: 'priv' });
      if (is(c0, 'exit', 2)) return done(['% Already at the top level.']);
      return bad();
    }
  
    if (mode === 'priv') {
      if (is(c0, 'disable', 3) || is(c0, 'exit', 2)) return done([], devices, { mode: 'user' });
      if (is(c0, 'configure', 4) && (!c1 || is(c1, 'terminal', 1)))
        return done(['Enter configuration commands, one per line.  End with CNTL/Z.'], devices, {
          mode: 'config',
        });
      if (
        (is(c0, 'write', 2) && (!c1 || is(c1, 'memory', 1))) ||
        (is(c0, 'copy', 3) && is(c1, 'running-config', 1))
      )
        return done(['Building configuration...', '[OK]']);
      return bad();
    }
  
    if (mode === 'config') {
      if (is(c0, 'hostname', 4)) {
        const err = checkName(c1, dev, devices);
        if (err) return done([`% ${err}`]);
        return done([], patch(devices, dev.id, { name: c1 }));
      }
      if (is(c0, 'interface', 3)) {
        if (dev.kind !== 'router')
          return done(['% Interface configuration is only simulated on routers in this lesson.']);
        const m = t.slice(1).join('').match(/^g[a-z]*(\d+\/\d+\/\d+)$/i);
        const port = m ? `GigabitEthernet${m[1]}` : '';
        if (!ROUTER_PORTS.includes(port))
          return done([
            '% Invalid interface. Try: interface g0/0/0  (ports 0/0/0, 0/0/1, 0/0/2)',
          ]);
        return done([], devices, { mode: 'if', iface: port });
      }
      if (is(c0, 'exit', 2)) return done([], devices, { mode: 'priv' });
      if (is(c0, 'end', 3)) return done([], devices, { mode: 'priv' });
      return bad();
    }
  
    // interface configuration mode
    const iface = session.iface;
    const cur = dev.ifaces[iface];
    const setIface = (p) =>
      patch(devices, dev.id, { ifaces: { ...dev.ifaces, [iface]: { ...cur, ...p } } });
  
    if (is(c0, 'ip', 2) && is(c1, 'address', 1)) {
      const ip = c2;
      const mask = c3;
      if (!ip || !mask) return done(['% Incomplete command. Use: ip address <ip> <mask>']);
      if (ipToNum(ip) === null || !isValidMask(mask) || !isHostAddress(ip, mask))
        return done(['% Invalid IP address or subnet mask.']);
      const clash = devices.find((d) => d.id !== dev.id && configuredIps(d).includes(ip));
      if (clash) return done([`% ${ip} is already used by ${clash.name}.`]);
      const overlap = Object.entries(dev.ifaces).find(
        ([n, i]) => n !== iface && i.ip && networkOf(i.ip, mask) === networkOf(ip, mask)
      );
      if (overlap) return done([`% ${ip} overlaps with ${overlap[0]}`]);
      return done([], setIface({ ip, mask }));
    }
    if (w(c0) === 'no' && is(c1, 'shutdown', 4))
      return done(
        [`%LINK-5-CHANGED: Interface ${iface}, changed state to up`],
        setIface({ up: true })
      );
    if (is(c0, 'shutdown', 4))
      return done(
        [`%LINK-5-CHANGED: Interface ${iface}, changed state to administratively down`],
        setIface({ up: false })
      );
    if (is(c0, 'exit', 2)) return done([], devices, { mode: 'config' });
    if (is(c0, 'end', 3)) return done([], devices, { mode: 'priv' });
    return bad();
  }
  
  export function runCommand(input, dev, session, devices, links) {
    if (!input.trim()) return { out: [], devices, session };
    const t = input.trim().split(/\s+/);
    if (['clear', 'cls'].includes(w(t[0]))) return { out: [], devices, session, clear: true };
    return dev.kind === 'pc'
      ? runPc(t, dev, devices, links)
      : runIos(t, dev, session, devices, links);
  }