import { Badge } from "./badge";
import { Badges } from "./base";
import { Project } from "./project";
import { User, applyMixins } from "./user";

class TombLabsBadges extends Badges { }
interface TombLabsBadges extends Project, User, Badge { }

applyMixins(TombLabsBadges, [Project, User, Badge]);

export default TombLabsBadges;
