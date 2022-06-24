<?php
/**
 * @file
 * Contains \Drupal\kh_import\EntityFields.
 */

namespace Drupal\kh_import;

use Drupal\Core\Entity\EntityTypeManager;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;

/**
 * EntityFields manager.
 */
class EntityFields {

  /**
   * To get Reference field ids.
  */

  public static function getTermReference($bundle, $terms) {

    //$bundle = strtolower($bundle);
    if (is_array($bundle)){
      foreach ($bundle as $key => $value) {
        $vid  = preg_replace('@[^a-z0-9_]+@','_', $value);
      }
    }else {
      $vid  = preg_replace('@[^a-z0-9_]+@','_', $bundle);
    }
    $vocabularies = \Drupal\taxonomy\Entity\Vocabulary::loadMultiple();

    /** Create Vocabulary if it is not exists **/
    if (!isset($vocabularies[$vid])) {
    }

    $termArray = explode(',', $terms);
    $termIds =[];
    return $termIds;
  }



  /**
   * To get user information based on emailIds
   */
  public static function getUserInfo($userArray) {
      $uids = [];
      foreach($userArray AS $usermail){
        $users = \Drupal::entityTypeManager()->getStorage('user')
        ->loadByProperties(['mail' => $usermail]);
        $user = reset($users);
        if ($user) {
          $uids[] = $user->id();
        }else{
          $user = \Drupal\user\Entity\User::create();
          $user->uid = '';
          $user->setUsername($usermail);
          $user->setEmail($usermail);
          $user->set("init", $usermail);
          $user->enforceIsNew();
          $user->activate();
          $user->save();

          $users = \Drupal::entityTypeManager()->getStorage('user')
            ->loadByProperties(['mail' => $usermail]);
          $uids[] = $user->id();
        }
      }
    return $uids;
  }

  /**
   * To get user information based on emailIds
   */
  public static function getNodeInfo($nodeTitles, $target_bundles) {
    $nids = [];
    foreach($nodeTitles AS $ntitle){
      $cTypes = array_keys($target_bundles)[0];
      $query = \Drupal::entityQuery('node')
          ->condition('title', $ntitle)
          ->condition('type', $cTypes);
      $nids = $query->execute();
      if ($nids){
        $nid = array_values($nids)[0];
        if ($node) {
          $nids[]['target_id'] = $nid;
        }
      }
    }
    return $nids;
  }

  /**
   * @param $row
   * @param $agency
   * @return array
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public static function getClassLocationReff($row, $agency) {
    $agency_nid = $agency->id();
    $region = $agency->field_regional_reference->target_id;
    $result = [];
    $location_name = '';
    if (!empty($row['field_user_location_reference'])) {
      $location_name = trim($row['field_user_location_reference']);
    }
    elseif(!empty($row['field_location_reference'])) {
      $location_name = trim($row['field_location_reference']);
    }
    if (!empty($location_name)) {
      //check location exist
      $query = \Drupal::service('entity.query')->get('node');
      $query->condition('type', 'location');
      $query->condition('field_location_name', $location_name);
      $query->condition('field_agency', $agency_nid );
      $query->condition('field_regional_reference', $region);
      $entity_ids = $query->execute();
      if (count($entity_ids) == 0) {

        $node = Node::create([
          'type'=> 'location',
          'title'=> $location_name,
          'field_location_name'=> $location_name,
          'field_agency'=> [
            'target_id' => $agency_nid,
          ],
          'field_regional_reference'=> [
            'target_id' => $region,
          ],
        ]);
        $node->save();
        $result['location_nid'] = $node->id();
      }
      else {
        $result['location_nid'] = current($entity_ids);
      }

    }
    //get class nid
    if (!empty($row['field_classroom_reference']) && !empty($result['location_nid'])) {
      $query = \Drupal::service('entity.query')->get('node');
      $query->condition('type', 'classroom');
      $query->condition('field_classroom_name', $row['field_classroom_reference']);
      $query->condition('field_agency', $agency_nid );
      $query->condition('field_location_reference', $result['location_nid']);
      $query->condition('field_regional_reference', $region);
      $entity_ids = $query->execute();
      if (count($entity_ids) == 0) {
        $node = Node::create([
          'type'=> 'classroom',
          'title'=> $row['field_classroom_reference'],
          'field_classroom_name'=> $row['field_classroom_reference'],
          'field_agency'=> [
            'target_id' => $agency_nid,
          ],
          'field_regional_reference'=> [
            'target_id' => $region,
          ],
          'field_location_reference'=> [
            'target_id' => $result['location_nid'],
          ],
        ]);
        $node->save();
        $result['class_nid'] = $node->id();
      }
      else {
        $result['class_nid'] = current($entity_ids);
      }
    }
    return $result;
  }

  /**
   * @param $row
   * @param $agency
   * @return false|int|mixed|string|null
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  public static function getFundingSourceRef($row, $agency) {
    $funded_by_nid = 0;
    if (!empty($row['field_funded_by'])) {
      //check location exist
      $field_funded_by = trim($row['field_funded_by']);
      $query = \Drupal::service('entity.query')->get('node');
      $query->condition('type', 'funding_source');
      $query->condition('title', $field_funded_by);
      $query->condition('field_gr', $field_funded_by );
      $entity_ids = $query->execute();
      if (count($entity_ids) == 0) {
        $node = Node::create([
          'type'=> 'funding_source',
          'title'=> $field_funded_by,
          'field_gr'=> $field_funded_by,
          'field_nickname'=> $field_funded_by
        ]);
        $node->save();
        $funded_by_nid = $node->id();
      }
      else {
        $funded_by_nid = current($entity_ids);
      }

      if(!empty($funded_by_nid)) {
        //check and update funding source to te agency
        $agency_funding_source = $agency->get('field_fun')->getValue();
        $funding_sorce_nids = [];
        if ($agency_funding_source) {
          foreach ($agency_funding_source as $f_src) {
            $funding_sorce_nids[] = $f_src['target_id'];
          }
        }

        if (!in_array($funded_by_nid, $funding_sorce_nids)) {
          $agency_funding_source[] = ['target_id' => $funded_by_nid];
          $agency->set('field_fun', $agency_funding_source);
          $agency->save();
        }
      }
    }
    return $funded_by_nid;
  }

  /**
   * @param $csv_row
   * @param $agency
   * @return false|int|mixed|string|null
   * @throws \Drupal\Core\Entity\EntityStorageException
   *
   */
  public static function getFamilyRef($csv_row, $agency){
    $fg_nid = 0;
    //Add a user as Primary Adult user details
    $pa_email = isset($csv_row['pa_email']) ? trim($csv_row['pa_email']) : '';
    $pa_first_name = isset($csv_row['pa_first_name']) ? trim($csv_row['pa_first_name']) : '';
    $pa_last_last_name = isset($csv_row['pa_last_last_name']) ? trim($csv_row['pa_last_last_name']) : '';
    $pa_phone = isset($csv_row['pa_phone']) ? trim($csv_row['pa_phone']) : '';
    $p_uid = 0;
    if (!empty($pa_email) || !empty($pa_phone)) {
      $query = \Drupal::service('entity.query')->get('user');
      if (!empty($pa_email)) {
        $query->condition('mail', $pa_email);
      }
      if (!empty($pa_phone)) {
        $query->condition('field_mobile_number', $pa_phone);
      }
      $entity_ids = $query->execute();
      $p_uid = current($entity_ids);
      $user = User::load($p_uid);
    }
    if ($p_uid == 0) {
      $user = User::create();
      $user->setPassword("password");
      $user->enforceIsNew();
      $user->set("status", '1');
      $user->set("field_agency_reference", ['target_id' => $agency->id()]);
      $user->set("field_user_regional_reference", ['target_id' => $agency->field_regional_reference->target_id]);
      $lname = substr($pa_last_last_name, -4);

      $newUsername = strtolower($pa_first_name . $lname);
      $user->set("field_adult_first_name", $pa_first_name);
      $user->set("field_adult_last_name", $pa_last_last_name);
      $user->set("field_mobile_number", $pa_phone);
      $user->addRole('family_member');
      $user->setEmail($pa_email);
      $checkUser = self::checkUsername($newUsername);
      if ( $checkUser > 0){
        $newUsername = strtolower($pa_first_name . $lname . ($checkUser + 1));
      }
      $user->setUsername($newUsername);
      $user->save();
      //$op = 'register_no_approval_required';
      //$mail = _user_mail_notify($op, $user, $langcode = 'en');
      $p_uid = $user->id();
    }
    if ($p_uid) {
      //Add/Update Family group
      $family_group_title = $pa_last_last_name;
      $query = \Drupal::service('entity.query')->get('node');
      $query->condition('type', 'family_group');
      $query->condition('uid', $p_uid);
      $query->condition('field_family_last_name', $pa_last_last_name);
      $query->condition('field_agency.target_id',  $agency->id());
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $fg_nid = current($entity_ids);
        // $family_node = Node::load($fg_nid);
      }
      else {

        $family_node = Node::create([
          'type' => 'family_group',
          'title' => $family_group_title,
          'field_regional_reference' =>  ['target_id' => $agency->field_regional_reference->target_id],
          'field_agency' => ['target_id' => $agency->id()],
          'field_family_last_name' => $family_group_title,
          'field_joined_user' =>  ['target_id' => $p_uid],
          'field_background_color_bottom' => "#FF232F",
          'field_background_color_middle' => "#F9DE6F",
          'field_background_color' => "#65BDE9",
          'uid' => $p_uid
        ]);
        $family_node->enforceIsNew(TRUE);
        $family_node->save();
        $fg_nid = $family_node->id();
      }

      $user->set("field_do_you_want_to_join_existi", 'no');
      $user->set("field_family_reference", ['target_id' => $fg_nid]);
      $user->save();
    }

    //Add/Update Secondary Adult user details
    $sa_email = isset($csv_row['sa_email']) ? trim($csv_row['sa_email']) : '';
    $sa_first_name = isset($csv_row['sa_first_name']) ? trim($csv_row['sa_first_name']) : '';
    $sa_last_name = isset($csv_row['sa_last_name']) ? trim($csv_row['sa_last_name']) : '';
    $sa_phone = isset($csv_row['sa_phone']) ? trim($csv_row['sa_phone']) : '';

    $sa_uid = 0;
    if (!empty($sa_email) || !empty($sa_phone)) {
      $query = \Drupal::service('entity.query')->get('user');
      if (!empty($sa_email)) {
        $query->condition('mail', $sa_email);
      }
      if (!empty($sa_phone)) {
        $query->condition('field_mobile_number', $sa_phone);
      }
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $sa_uid = current($entity_ids);
        $sa_user = User::load($sa_uid);
      }

      if ($sa_uid == 0) {
        $sa_user = User::create();
        $sa_user->setPassword("password");
        $sa_user->enforceIsNew();
        $sa_user->set("status", '1');
        $sa_user->set("field_agency_reference", ['target_id' => $agency->id()]);
        $sa_user->set("field_user_regional_reference", ['target_id' => $agency->field_regional_reference->target_id]);

        $sa_lname = substr($sa_last_name, -4);

        $newSuname = strtolower($sa_first_name . $sa_lname);
        $checkSU = self::checkUsername($newSuname);
        if ($checkSU > 0) {
          $newSuname = strtolower($sa_first_name . $sa_lname . ($checkSU + 1));
        }
        $sa_user->setUsername($newSuname);
        if ($sa_email) {
          $sa_user->setEmail($sa_email);
        }
      }
      $sa_user->set("field_adult_first_name", $sa_first_name);
      $sa_user->set("field_adult_last_name", $sa_last_name);
      if ($sa_phone) {
        $sa_user->set("field_mobile_number", $sa_phone);
      }
      $sa_user->addRole('family_member');
      $sa_user->set("field_do_you_want_to_join_existi", 'no');
      $sa_user->set("field_family_reference", ['target_id' => $fg_nid] );
      $sa_user->save();
      $family_node = Node::load($fg_nid);
      $members = $family_node->get('field_joined_user')->getValue();
      $fm_update = [];
      //echo $fg_nid;
      //print_r($members);
      if ($members) {
        foreach ($members as $fm) {
          if ($fm['target_id'] != $sa_user->id()) {
            $fm_update[] = $fm;
          }
        }
      }
      $fm_update[] = ['target_id' => $sa_user->id()];
      //print_r($fm_update);
      $family_node->set('field_joined_user', $fm_update);
      $family_node->save();
      if ($sa_uid == 0) {
        //$sa_user = User::load($sa_uid);
        //$op = 'register_no_approval_required';
        //$mail = _user_mail_notify($op, $sa_user, $langcode = 'en');
      }

    }

    return $fg_nid;
  }

  /**
   * @param $name
   * @return int|void
   */
  public static function checkUsername($name){
    $database = \Drupal::database();
    $query = $database->query("SELECT uid FROM {users_field_data} WHERE name LIKE '%".$name."%'");
    $result = $query->fetchAll();
    return count($result);
  }
}
