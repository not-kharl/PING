export const ROUTER_PORTS = [
    'GigabitEthernet0/0/0',
    'GigabitEthernet0/0/1',
    'GigabitEthernet0/0/2',
];
// Cisco router ports start shut down, so they start with up: false
export function newIfaces(kind) {
    const out = {};
    if (kind === 'router')
        ROUTER_PORTS.forEach((p) => (out[p] = { up: false }));
    return out;
}
export function ipToNum(ip) {
    const parts = ip.trim().split('.');
    if (parts.length !== 4)
        return null;
    let n = 0;
    for (const p of parts) {
        if (!/^\d{1,3}$/.test(p))
            return null;
        const v = Number(p);
        if (v > 255)
            return null;
        n = n * 256 + v;
    }
    return n;
}
export function isValidMask(mask) {
    const m = ipToNum(mask);
    if (m === null || m === 0)
        return false;
    const inv = ~m >>> 0;
    return (inv & (inv + 1)) === 0; // ones must be contiguous
}
export const networkOf = (ip, mask) => ((ipToNum(ip) & ipToNum(mask)) >>> 0);
export function isHostAddress(ip, mask) {
    const i = ipToNum(ip);
    const m = ipToNum(mask);
    if (i === null || m === null || !isValidMask(mask))
        return false;
    const net = (i & m) >>> 0;
    const bcast = (net | ~m) >>> 0;
    return i !== net && i !== bcast;
}
// Addresses that are actually "live" (router ports must be turned on)
export function addressesOf(d) {
    if (d.kind === 'pc')
        return d.ip && d.mask ? [{ ip: d.ip, mask: d.mask }] : [];
    return Object.values(d.ifaces)
        .filter((i) => i.up && i.ip && i.mask)
        .map((i) => ({ ip: i.ip, mask: i.mask }));
}
// Every IP set on the device, even if the port is down (for duplicate checks)
export function configuredIps(d) {
    if (d.kind === 'pc')
        return d.ip ? [d.ip] : [];
    return Object.values(d.ifaces)
        .filter((i) => i.ip)
        .map((i) => i.ip);
}
// Devices reachable by cable. Only switches pass traffic along.
function l2Reach(fromId, devices, links) {
    const byId = new Map(devices.map((d) => [d.id, d]));
    const seen = new Set([fromId]);
    const queue = [fromId];
    while (queue.length) {
        const cur = queue.shift();
        if (cur !== fromId && byId.get(cur)?.kind !== 'switch')
            continue;
        for (const l of links) {
            const next = l.a === cur ? l.b : l.b === cur ? l.a : null;
            if (next && !seen.has(next)) {
                seen.add(next);
                queue.push(next);
            }
        }
    }
    return seen;
}
const fail = (hint) => ({ ok: false, hint });
export function pingCheck(src, targetIp, devices, links) {
    const srcAddrs = addressesOf(src);
    if (srcAddrs.length === 0)
        return fail(`${src.name} has no IP address configured.`);
    if (srcAddrs.some((a) => a.ip === targetIp))
        return { ok: true };
    const dst = devices.find((d) => d.id !== src.id && addressesOf(d).some((a) => a.ip === targetIp));
    if (!dst)
        return fail(`No device answers at ${targetIp}. Check the address and that the port is turned on.`);
    const dstAddr = addressesOf(dst).find((a) => a.ip === targetIp);
    const reach = l2Reach(src.id, devices, links);
    const onLink = srcAddrs.find((a) => networkOf(a.ip, a.mask) === networkOf(targetIp, a.mask));
    // Same network: needs a cable path and agreeing masks
    if (onLink) {
        if (!reach.has(dst.id))
            return fail(`No cable path from ${src.name} to ${dst.name}.`);
        if (networkOf(dstAddr.ip, dstAddr.mask) !== networkOf(onLink.ip, dstAddr.mask))
            return fail(`The subnet masks of ${src.name} and ${dst.name} don't agree.`);
        return { ok: true };
    }
    // Different network: needs a PC with a working default gateway
    if (src.kind !== 'pc')
        return fail(`${src.name} has no route to ${targetIp} (only directly connected networks are simulated).`);
    if (!src.gateway)
        return fail(`${targetIp} is on another network and ${src.name} has no default gateway.`);
    const a = srcAddrs[0];
    if (networkOf(src.gateway, a.mask) !== networkOf(a.ip, a.mask))
        return fail(`The default gateway ${src.gateway} is not in ${src.name}'s network.`);
    const gw = devices.find((d) => d.kind === 'router' && addressesOf(d).some((x) => x.ip === src.gateway));
    if (!gw)
        return fail(`Nothing answers at the gateway ${src.gateway}. Set the router's IP and run "no shutdown".`);
    if (!reach.has(gw.id))
        return fail(`No cable path from ${src.name} to the router ${gw.name}.`);
    if (dst.id === gw.id)
        return { ok: true };
    if (dst.kind !== 'pc')
        return fail('Routing between routers is not simulated.');
    const out = addressesOf(gw).find((x) => networkOf(x.ip, x.mask) === networkOf(targetIp, x.mask));
    if (!out)
        return fail(`${gw.name} has no port in the network of ${targetIp}.`);
    if (!l2Reach(gw.id, devices, links).has(dst.id))
        return fail(`No cable path from ${gw.name} to ${dst.name}.`);
    if (networkOf(out.ip, dstAddr.mask) !== networkOf(dstAddr.ip, dstAddr.mask))
        return fail(`The subnet mask on ${dst.name} doesn't match ${gw.name}'s port.`);
    if (dst.gateway !== out.ip)
        return fail(`${dst.name} can't reply: its default gateway should be ${out.ip}.`);
    return { ok: true };
}
