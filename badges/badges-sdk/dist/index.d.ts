import { Badge } from "./badge";
import { Badges } from "./base";
import { Project } from "./project";
import { User } from "./user";
declare class TombLabsBadges extends Badges {
}
interface TombLabsBadges extends Project, User, Badge {
}
export default TombLabsBadges;
