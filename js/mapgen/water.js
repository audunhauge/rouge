// @ts-check
import { fbm_noise, mix } from './util.js';

// NOTE: r_water, r_ocean, other fields are boolean valued so it
// could be more efficient to pack them as bit fields in Uint8Array

/* a region is water if the noise value is low */
/**
 * @param {any[]} r_water
 * @param {{ numRegions: number; r_ghost: (arg0: number) => any; r_boundary: (arg0: number) => any; r_x: (arg0: number) => number; r_y: (arg0: number) => number; }} mesh
 * @param {{ noise2D: (arg0: number, arg1: number, arg2: number) => number; }} noise
 * @param {{ amplitudes: string | any[]; round: number; inflate: number; }} params
 */
export function assign_r_water(r_water, mesh, noise, params) {
    r_water.length = mesh.numRegions;
    for (let r = 0; r < mesh.numRegions; r++) {
        if (mesh.r_ghost(r) || mesh.r_boundary(r)) {
            r_water[r] = true;
        } else {
            let nx = (mesh.r_x(r) - 500) / 500;
            let ny = (mesh.r_y(r) - 500) / 500;
            let distance = Math.max(Math.abs(nx), Math.abs(ny));
            let n = fbm_noise(noise, params.amplitudes, nx, ny);
            n = mix(n, 0.5, params.round);
            r_water[r] = n - (1.0 - params.inflate) * distance*distance < 0;
        }
    }
    return r_water;
}


/* a region is ocean if it is a water region connected to the ghost region,
   which is outside the boundary of the map; this could be any seed set but
   for islands, the ghost region is a good seed */
/**
 * @param {any[]} r_ocean
 * @param {{ numRegions: any; ghost_r: () => any; r_circulate_r: (arg0: any[], arg1: any) => void; }} mesh
 * @param {any[]} r_water
 */
export function assign_r_ocean(r_ocean, mesh, r_water) {
    r_ocean.length = mesh.numRegions;
    r_ocean.fill(false);
    let stack = [mesh.ghost_r()];
    let r_out = [];
    while (stack.length > 0) {
        let r1 = stack.pop();
        mesh.r_circulate_r(r_out, r1);
        for (let r2 of r_out) {
            if (r_water[r2] && !r_ocean[r2]) {
                r_ocean[r2] = true;
                stack.push(r2);
            }
        }
    }
    return r_ocean;
}
