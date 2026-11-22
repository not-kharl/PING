const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

// Ports each kind of device has, in the order cables take them
export const PORTS = {
  pc: ['FastEthernet0'],
  switch: [
    ...range(24).map((n) => `FastEthernet0/${n}`),
    'GigabitEthernet0/1',
    'GigabitEthernet0/2',
  ],
  router: ['GigabitEthernet0/0/0', 'GigabitEthernet0/0/1', 'GigabitEthernet0/0/2'],
};

// FastEthernet0/1 -> Fa0/1, GigabitEthernet0/0/0 -> Gig0/0/0
export function shortPort(name) {
  return name.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gig');
}

// First port on the device that has no cable yet (null if all are used)
export function firstFreePort(device, links) {
  const used = new Set();
  links.forEach((l) => {
    if (l.a === device.id) used.add(l.aPort);
    if (l.b === device.id) used.add(l.bPort);
  });
  return (PORTS[device.kind] || []).find((p) => !used.has(p)) ?? null;
}