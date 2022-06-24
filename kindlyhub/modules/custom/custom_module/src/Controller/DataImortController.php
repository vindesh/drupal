<?php
/**
 * @file
 * Contains \Drupal\custom_module\Controller\DataImortController.
 */
namespace Drupal\custom_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;
use Drupal\file\Entity\File;
use Drupal\file\Entity;
use Drupal\Core\Entity\EntityInterface;
use \Drupal\Core\Routing;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\field\Entity\FieldConfig;
use Drupal\Core\StreamWrapper\PrivateStream;
use Drupal\Core\StreamWrapper\PublicStream;
use Twilio\Rest\Client;

class DataImortController extends ControllerBase{ 

  public function DataImport(Request $request) {
  
        $form = \Drupal::formBuilder()->getForm('Drupal\custom_module\Form\DataImportForm');
        return $form;

  }

  public function sessinkind(Request $request){
  //print_r(json_decode($_REQUEST['nodes'])); die;
 
    $tempstore = \Drupal::service('user.private_tempstore')->get('custom_module');
    $tempstore->set('inkind_nodes', $_REQUEST['nodes']);
    $some_data1 = $tempstore->get('inkind_nodes');

    $result = ['request' => $_REQUEST['nodes'], 'getRequest' => $some_data1];

    $reaponse =  new JsonResponse( $result );
    return $reaponse;
  }
 
  public static function ProcessUpload($row, &$context) {
// echo "<pre>";
// print_r($row); die;


        $handle = fopen($file->destination, 'r');
        $locationID = [];
        $classroomID = [];
        $LocationNodeId = '';
        $ClassNodeId = '';
        
        $locationrefrence = [];
        $classrefrence = [];

        $type = 'family';
        //$type = 'staff';




        if($type == 'staff'){
               //for location's     
            $agency = '379';
            // echo "<pre>";
            // print_r($row); die;
            if(!empty($row[5])){
                 $userExist = self::user_checkEmail(trim($row[5]));
                  $LocationTitle =  trim($row[3]) == "Admin" ? "Admin Office" : trim($row[3]);
                  if(!empty($row[3])){
                      $LocationNodeId = self::CreateLocation($LocationTitle, $agency);
                  }
                  //echo $LocationNodeId; die;
                  if(($row[4] != "" ) && !empty($LocationNodeId)){

                      $ClassTitle =  trim($row[4]);
                      //$checktitle =  $LocationTitle.' '.trim($row[4]);
                      $ClassNodeId = self::CreateClassroom($ClassTitle, $LocationNodeId, $agency);
                      $classroomID[$ClassNodeId] = $ClassTitle;

                    }
                if(!empty($userExist)){
                  $user = \Drupal\user\Entity\User::load($userExist);
                  // echo "<pre>";
                  // print_r($row);

                      $locationrefrence = $user->get('field_user_location_reference')->getValue();
                      $locationrefrence[] = array('target_id' => $LocationNodeId);
                      $classrefrence = $user->get('field_classroom_reference')->getValue();
                      $classrefrence[] = array('target_id' => $ClassNodeId);
                      
                                          
                    $user->set('field_user_location_reference', $locationrefrence);
                    $user->set('field_classroom_reference', $classrefrence);
                    $user->save();
                }else{
                  
                  $userValues = array(
                      'fname' => $row[0],
                      'lname' => $row[1],
                      'job' => $row[2],
                      'location' => $LocationNodeId,
                      'class' => $ClassNodeId,
                      'mail' => $row[5],
                      'uname' => $row[6],
                      'role' => $row[7],
                      'agency' => $agency
                    );
                  // echo "<pre>";
                  // print_r($userValues); 
                  $userId = self::CreateStaff($userValues);
                }
              $item = $row[6];
            }
        }


              if($type == 'family'){

                $SecondUserId = '';
                $userIdArr = [];
                $checkUname = [];

                $family = self::AddPrimaryFamilymember($row);
                
                $item = $row[7]."--".$row[8];     
              }
   
    $context['results'][] = $item;
    $context['message'] = t('Created @title', array('@title' => $item));
  }


  public static function CreateLocation($title, $agency){

    $nodeId = self::FindNodeId($title,'location', $agency);

    if(empty($nodeId) && $nodeId == ""){
      $node = Node::create([
        'type' => 'location',
        'field_regional_reference' =>  array('target_id' => '211') ,
        'field_agency' => array('target_id' => $agency),
        'field_location_name' => $title,
        'field_background_color_bottom' => "#FF232F",
        'field_background_color_middle' => "#F9DE6F",
        'field_background_color' => "#65BDE9",
      ]);
      $node->enforceIsNew(TRUE);
      $node->save();
      $nodeId = $node->id();
    }

    return $nodeId;
    
  }


   public static function CreateClassroom($title, $LocationNodeId, $agency){

    $nodeId = self::FindNodeId($title,'classroom', $LocationNodeId);

    if(empty($nodeId) && $nodeId == ""){

    $node = Node::create([
      'type' => 'classroom',
      'field_regional_reference' =>  array('target_id' => '211'),
      'field_agency' => array('target_id' => $agency),
      'field_location_reference' => array('target_id' => $LocationNodeId),
      'field_classroom_name' => $title,
      'field_background_color_bottom' => "#FF232F",
      'field_background_color_middle' => "#F9DE6F",
      'field_background_color' => "#65BDE9",
    ]);
    $node->enforceIsNew(TRUE);
    $node->save();
     $nodeId = $node->id();
    }

    return $nodeId;
    
  }


  public static function CreateFamilyGrp($title, $PrimeUserId, $agency){

    $nodeId = self::FindNodeId($title,'family_group', $PrimeUserId);

    if(empty($nodeId) && $nodeId == ""){

          $joined = array(array('target_id' => $PrimeUserId));

        $node = Node::create([
          'type' => 'family_group',
          'field_regional_reference' =>  array('target_id' => '211'),
          'field_agency' => array('target_id' => $agency),
          'field_family_last_name' => $title,
          'field_joined_user' =>  $joined,
          'field_background_color_bottom' => "#FF232F",
          'field_background_color_middle' => "#F9DE6F",
          'field_background_color' => "#65BDE9",
          'uid' => $PrimeUserId
        ]);
        $node->enforceIsNew(TRUE);
        $node->save();
        $nodeId = $node->id();
    }
//echo $nodeId; die;
    return $nodeId;
    
  }


  public static function CreateStudent_child($studentArr){

     $nodeId = self::FindNodeId($studentArr['field_uuid'],'student', $studentArr['loc']);

    if(empty($nodeId) && $nodeId == ""){

      $farr = array('09CH9132' => '1795', '09HP0030' => '1794');

        $node = Node::create([
          'type' => 'student',
          'field_regional_reference' =>  array('target_id' => '211'),
          'field_agency' => array('target_id' => $studentArr['agency']),
          'field_student_first_name' => $studentArr['fname'],
          'field_student_last_name' => $studentArr['lname'],
          'field_uuid' => $studentArr['field_uuid'],
          'field_family_reference' => array('target_id' => $studentArr['family']),
          'field_location_reference' => array('target_id' => $studentArr['loc']),
          'field_classroom_reference' => array('target_id' => $studentArr['class']),
          'field_background_color_bottom' => "#FF232F",
          'field_background_color_middle' => "#F9DE6F",
          'field_background_color' => "#65BDE9",
          'uid' => $studentArr['uid'],
          'field_funded_by' => $farr[$studentArr['fund']],
          'field_date_of_birth' => date('Y-m-d', strtotime($studentArr['dob']))

        ]);
        $node->enforceIsNew(TRUE);

        $node->save();

        //$nodeId = $node->id();
    }else{

      $nodeUpdate = Node::load($nodeId);
      $field_joined_user = $nodeUpdate->get('field_family_reference')->getValue();
      $field_joined_user[] = array(
        'target_id' => $studentArr['family']
      );
      $nodeUpdate->field_family_reference = $field_joined_user;
      $nodeUpdate->save();
    }

    return $nodeId;    
  }


  public static function CreateStaff($values){

    $rolesArr = array('Agency Administrator' => 'agency_administrator','Agency Manager' => 'agency_manager','Staff' => 'teacher',
      'Location Manager' => 'school_manager' );
      $user = User::create();
      //Mandatory settings
      $user->setPassword("password");
      $user->enforceIsNew();

      $user->set("status", '1');
      $user->set("field_agency_reference", array('target_id' => $values['agency']));
      $user->set("field_user_regional_reference", array('target_id' => '211'));
      $user->set("field_adult_first_name", $values['fname']); 
      $user->set("field_adult_last_name", $values['lname']);
      $user->setEmail($values['mail']);
      $user->setUsername($values['uname']);
      $user->addRole($rolesArr[$values['role']]); //E.g: authenticated
      $user->set("field_position_title", $values['job']);
      $user->set("field_user_location_reference", array('target_id' => $values['location']));
      $user->set("field_classroom_reference", array('target_id' => $values['class']));
      $user->save();
      $uuid = $user->id();

	$user1 = \Drupal\user\Entity\User::load($uuid);
	$op = 'register_no_approval_required';
	$mail = _user_mail_notify($op, $user1, $langcode = 'en');
  }


  public static function FindNodeId($title, $type, $locationId){

    if ($type == "location") {
      # code...
      $query = db_select('node_field_data', 'n');
      $query->leftjoin('node__field_agency', 'lc', 'n.nid = lc.entity_id');
      $query->fields('n',array('nid'));
      $query->condition('n.title',$title, 'LIKE');
      $query->condition('n.type',$type,'=');
      $query->condition('lc.field_agency_target_id', $locationId, '=');
      $results = $query->execute()->fetchField();
      return $results;
    }

    if($type == "classroom"){
      //echo $type."---".$title."--".$locationId;
      $query = db_select('node_field_data', 'n');
      $query->leftjoin('node__field_location_reference', 'lc', 'n.nid = lc.entity_id');
      $query->fields('n',array('nid'));
      $query->condition('n.title',$title, 'LIKE');
      $query->condition('n.type',$type,'=');
      $query->condition('lc.field_location_reference_target_id', $locationId, '=');
      $results = $query->execute()->fetchField();
      return $results;
      //echo $results; die;
    }  

    if ($type == "family_group") {
      # code...
      $query = db_select('node_field_data', 'n');
      $query->leftjoin('node__field_family_last_name', 'ln', 'n.nid = ln.entity_id');
      $query->fields('n',array('nid'));
      $query->condition('n.uid',$locationId, '=');
      $query->condition('n.type',$type,'=');
      $query->condition('ln.field_family_last_name_value', $title, '=');
      $results = $query->execute()->fetchField();
      return $results;
     
    }

     if ($type == "student") {

      //echo $title."---".$locationId; 
      # code...
      $query = db_select('node__field_uuid', 'n');
      $query->fields('n',array('entity_id'));
      $query->condition('n.field_uuid_value', $title, '=');
      $results = $query->execute()->fetchField();
      //print_r($results); die;
      return $results;
     
    }

    return;

  }


  public static function user_checkPhone($phone){

    $UserId = db_select('user__field_mobile_number“', 'm')
      ->fields('m',array('entity_id'))
      ->condition('field_mobile_number_value',$phone,'=')
      ->execute()
      ->fetchField();
      return $UserId;

  }

  public static function user_checkEmail($mail){

    $UserId = db_select('users_field_data', 'm')
      ->fields('m',array('uid'))
      ->condition('mail',$mail,'=')
      ->execute()
      ->fetchField();
      return $UserId;

  }

  public static function user_UName($name){

    $UserId = db_select('users_field_data', 'm')
      ->fields('m',array('uid'))
      ->condition('name','%'.$name.'%','LIKE')
      ->execute()
      ->fetchAll();
      return count($UserId);

  }

  public static function AddPrimaryFamilymember($row){
   
    $agency = '379';
    $pmail = $row[9];
    $pfname = $row[7];
    $plname = $row[8];
    $pphone = $row[10];
    $loc = $row[5];
    $class = $row[6];
    $smail = $row[13];
    $sfname = $row[11];
    $slname = $row[12];
    $sphone = $row[14];

// echo "<pre>";
// print_r($row); die;
    if((!empty($plname) && !empty($pfname)) ||  !empty($pmail) || !empty($pphone)){

                    $userExist = self::user_checkEmail($pmail);
                    $userExistPhone = self::user_checkPhone($pphone);
                    $userExist = !empty($userExist) ? $userExist : $userExistPhone;

                    if(empty($userExist)){

                      $user = User::create();
                      $user->setPassword("password");
                      $user->enforceIsNew();
                      $user->set("status", '1');
                      $user->set("field_agency_reference", array('target_id' => $agency));
                      $user->set("field_user_regional_reference", array('target_id' => '211'));

                      $fname = trim($pfname);
                      $fname = $fname[0];
                      $lname = substr($plname, -4);

                      $newUname = strtoupper($fname.$lname);
                      $checkU = self::user_UName($newUname);
                      if($checkU > 0){
                        $newUname = strtoupper($fname.$lname.($checkU + 1));
                      }
 
                      $ids = \Drupal::entityQuery('user')
                      ->condition('name', $newUname)
                      ->range(0, 1)
                      ->execute();
                      if(empty($ids)){
                        $user->setUsername($newUname);                          
                      }

                      $user->set("field_adult_first_name", $pfname); 
                      $user->set("field_adult_last_name", $plname);
                      $user->set("field_mobile_number", $pphone);
                      $user->addRole('family_member');
                      $user->setEmail($pmail); 
                      $user->save();
                      $uid = $user->id();

                     


                      $familyGrpId = self::CreateFamilyGrp(trim($plname), $uid, $agency);
                      $LocationNodeId = self::CreateLocation(trim($loc), $agency);
                      $ClassNodeId = self::CreateClassroom(trim($class), $LocationNodeId, $agency);
                      $studentArr = [
                      'fname' => isset($row[1]) ? trim($row[1]) : '',
                      'lname' => isset($row[2]) ? trim($row[2]) : '',
                      'dob' => isset($row[3]) ? trim($row[3]) : '',
                      'agency' => $agency,
                      'loc' => isset($LocationNodeId) ? $LocationNodeId : '',
                      'class' => isset($ClassNodeId) ? $ClassNodeId : '',
                      'family' => $familyGrpId,
                      'uid' => $uid,
                      'fund' => $row[4],
                      'checkTitle' => trim($row[2].', '.$row[1]),
                      'field_uuid' => trim($row[0])
                      ];

                      $studentId = self::CreateStudent_child($studentArr);

                        $user = \Drupal\user\Entity\User::load($uid);
                        $user->set("field_do_you_want_to_join_existi", 'no');
                        $user->set("field_family_reference", array('target_id' => $familyGrpId));

                        $op = 'register_no_approval_required';
                        $mail = _user_mail_notify($op, $user, $langcode = 'en');
                        $user->save();

                    }
                        //$abcd = \Drupal\custom_module\Form\DataImportForm::sendMessageTouser($pphone);


                    if((!empty($slname) && !empty($sfname)) ||  !empty($smail) || !empty($sphone)){

                      if(($smail != $pmail) && $sphone != $pphone){
                        $secondArr = array(
                          'fname' => $sfname,
                          'lname' => $slname,
                          'email' => $smail,
                          'phone' => $sphone,
                          'family' => $familyGrpId,
                          'agency' => $agency

                        );
                        $second = self::AddSecondryFamilymember($secondArr);
                      }           

                    }

                  }
                 
  }


  public static function AddSecondryFamilymember($secondArr){
   
    $agency = $secondArr['agency'];
    $smail = $secondArr['email'];
    $sfname = $secondArr['fname'];
    $slname = $secondArr['lname'];
    $sphone = $secondArr['phone'];
    $family = $secondArr['family'];

    $userExist = self::user_checkEmail($smail);
    $userExistPhone = self::user_checkPhone($sphone);
    $userExist = !empty($userExist) ? $userExist : $userExistPhone;

    if(empty($userExist)){
    
          $user = User::create();
          $user->setPassword("password");
          $user->enforceIsNew();
          $user->set("status", '1');
          $user->set("field_agency_reference", array('target_id' => $agency));
          $user->set("field_user_regional_reference", array('target_id' => '211'));

          $fname = trim($sfname);
          $fname = $fname[0];
          $lname = substr($slname, -4);

          $newUname = strtoupper($fname.$lname);
          $checkU = self::user_UName($newUname);
          if($checkU > 0){
            $newUname = strtoupper($fname.$lname.($checkU + 1));
          }

          $ids = \Drupal::entityQuery('user')
          ->condition('name', $newUname)
          ->range(0, 1)
          ->execute();
          if(empty($ids)){
            $user->setUsername($newUname);                          
          }

          $user->set("field_adult_first_name", $sfname); 
          $user->set("field_adult_last_name", $slname);
          $user->addRole('family_member');
          $user->set("field_mobile_number", $sphone);
          $user->set("field_do_you_want_to_join_existi", 'no');
          $user->set("field_family_reference", array('target_id' => $family));
          $user->setEmail($smail); 
          $user->save();
          $uid = $user->id();

          $user = \Drupal\user\Entity\User::load($uid);
         
          $op = 'register_no_approval_required';
          //$abcd = \Drupal\custom_module\Form\DataImportForm::sendMessageTouser($sphone);
          $mail = _user_mail_notify($op, $user, $langcode = 'en');
      }
  }

}
