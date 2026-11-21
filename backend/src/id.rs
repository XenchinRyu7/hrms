use rand::Rng;

const ALPHABET: &[u8] = b"23456789abcdefghjkmnpqrstuvwxyz";

/// Generates a compact, readable prefixed identifier (e.g. "emp_8k2m9a1x", "exp_3f8x2m9a").
/// Avoids easily confused characters (0, O, 1, l, I).
pub fn gen_id(prefix: &str) -> String {
    let mut rng = rand::thread_rng();
    let suffix: String = (0..8)
        .map(|_| {
            let idx = rng.gen_range(0..ALPHABET.len());
            ALPHABET[idx] as char
        })
        .collect();

    if prefix.is_empty() {
        suffix
    } else {
        format!("{}_{}", prefix, suffix)
    }
}
